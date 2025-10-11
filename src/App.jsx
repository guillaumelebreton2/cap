import { useState, useEffect } from 'react'
import './App.css'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Box from '@mui/material/Box'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Checkbox from '@mui/material/Checkbox'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import dayjs from 'dayjs'
import 'dayjs/locale/fr'

function App() {
  const [vma, setVma] = useState('')
  const [blocs, setBlocs] = useState([])
  const [historique, setHistorique] = useState([])
  const [nomSeance, setNomSeance] = useState('')
  const [dateSeance, setDateSeance] = useState('')
  const [typingTimeouts, setTypingTimeouts] = useState({})
  const [seanceEnCoursEdition, setSeanceEnCoursEdition] = useState(null)
  const [typeTri, setTypeTri] = useState('dateCreation') // 'dateSeance', 'dateCreation', 'manuel'
  const [ordreManuel, setOrdreManuel] = useState([]) // Tableau d'IDs pour l'ordre manuel
  const [seancesSelectionnees, setSeancesSelectionnees] = useState([]) // IDs des séances sélectionnées

  // Charger l'historique depuis localStorage au démarrage
  useEffect(() => {
    const historiqueStocke = localStorage.getItem('plan-marathon-historique')
    if (historiqueStocke) {
      setHistorique(JSON.parse(historiqueStocke))
    }

    // Charger les préférences de tri
    const typTriStocke = localStorage.getItem('plan-marathon-typeTri')
    if (typTriStocke) {
      setTypeTri(typTriStocke)
    }

    const ordreManuelStocke = localStorage.getItem('plan-marathon-ordreManuel')
    if (ordreManuelStocke) {
      setOrdreManuel(JSON.parse(ordreManuelStocke))
    }
  }, [])

  // Sauvegarder l'historique dans localStorage
  const sauvegarderHistorique = (nouvelleSeance) => {
    const nouvelHistorique = [...historique, { ...nouvelleSeance, id: Date.now(), dateCreation: new Date().toISOString() }]
    setHistorique(nouvelHistorique)
    localStorage.setItem('plan-marathon-historique', JSON.stringify(nouvelHistorique))
  }

  // Supprimer une séance de l'historique
  const supprimerSeance = (id) => {
    const nouvelHistorique = historique.filter(s => s.id !== id)
    setHistorique(nouvelHistorique)
    localStorage.setItem('plan-marathon-historique', JSON.stringify(nouvelHistorique))
  }

  // Dupliquer une séance de l'historique
  const dupliquerSeanceHistorique = (seance) => {
    // Créer la copie avec un nouveau nom et sans date de séance
    const nouvelleSeance = {
      ...seance,
      id: Date.now(),
      nom: `Copie de ${seance.nom}`,
      dateSeance: '',
      dateCreation: new Date().toISOString(),
      blocs: JSON.parse(JSON.stringify(seance.blocs)) // Deep copy
    }

    // Ajouter la copie à l'historique
    const nouvelHistorique = [...historique, nouvelleSeance]
    setHistorique(nouvelHistorique)
    localStorage.setItem('plan-marathon-historique', JSON.stringify(nouvelHistorique))

    // Charger la copie en mode édition
    modifierSeance(nouvelleSeance)
  }

  // Modifier une séance existante (charger en mode édition)
  const modifierSeance = (seance) => {
    setSeanceEnCoursEdition(seance)
    setVma(seance.vma || '')
    setBlocs(JSON.parse(JSON.stringify(seance.blocs))) // Deep copy pour éviter mutations
    setNomSeance(seance.nom || '')
    setDateSeance(seance.dateSeance || '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Mettre à jour une séance existante
  const mettreAJourSeance = () => {
    if (!nomSeance.trim()) {
      alert('Veuillez donner un nom à la séance')
      return
    }
    if (!seanceEnCoursEdition) return

    const nouvelHistorique = historique.map(s =>
      s.id === seanceEnCoursEdition.id
        ? { ...s, nom: nomSeance, vma, blocs, dateSeance }
        : s
    )
    setHistorique(nouvelHistorique)
    localStorage.setItem('plan-marathon-historique', JSON.stringify(nouvelHistorique))

    // Réinitialiser le formulaire et sortir du mode édition
    setSeanceEnCoursEdition(null)
    setNomSeance('')
    setVma('')
    setBlocs([])
    setDateSeance('')
    alert('Séance mise à jour !')
  }

  // Annuler l'édition
  const annulerEdition = () => {
    setSeanceEnCoursEdition(null)
    setNomSeance('')
    setVma('')
    setBlocs([])
    setDateSeance('')
  }

  // Obtenir l'historique trié
  const obtenirHistoriqueTrie = () => {
    let historiqueTrie = [...historique]

    if (typeTri === 'dateSeance') {
      historiqueTrie.sort((a, b) => {
        // Les séances sans date vont à la fin
        if (!a.dateSeance && !b.dateSeance) return 0
        if (!a.dateSeance) return 1
        if (!b.dateSeance) return -1
        return new Date(b.dateSeance) - new Date(a.dateSeance)
      })
    } else if (typeTri === 'dateCreation') {
      historiqueTrie.sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation))
    } else if (typeTri === 'manuel' && ordreManuel.length > 0) {
      // Trier selon l'ordre manuel
      historiqueTrie.sort((a, b) => {
        const indexA = ordreManuel.indexOf(a.id)
        const indexB = ordreManuel.indexOf(b.id)
        // Si un ID n'est pas dans ordreManuel, le mettre à la fin
        if (indexA === -1 && indexB === -1) return 0
        if (indexA === -1) return 1
        if (indexB === -1) return -1
        return indexA - indexB
      })
    }

    return historiqueTrie
  }

  // Changer le type de tri
  const changerTypeTri = (nouveauType) => {
    // Si on passe du manuel à un autre tri, sauvegarder l'ordre actuel
    if (typeTri === 'manuel' && nouveauType !== 'manuel') {
      const ordreActuel = obtenirHistoriqueTrie().map(s => s.id)
      setOrdreManuel(ordreActuel)
      localStorage.setItem('plan-marathon-ordreManuel', JSON.stringify(ordreActuel))
    }

    // Si on passe à manuel et qu'il n'y a pas d'ordre sauvegardé, utiliser l'ordre actuel
    if (nouveauType === 'manuel' && ordreManuel.length === 0) {
      const ordreActuel = obtenirHistoriqueTrie().map(s => s.id)
      setOrdreManuel(ordreActuel)
      localStorage.setItem('plan-marathon-ordreManuel', JSON.stringify(ordreActuel))
    }

    setTypeTri(nouveauType)
    localStorage.setItem('plan-marathon-typeTri', nouveauType)
  }

  // Déplacer une séance vers le haut en mode manuel
  const deplacerSeanceHaut = (index) => {
    if (index === 0) return
    const historiqueTrie = obtenirHistoriqueTrie()
    const nouvelOrdre = historiqueTrie.map(s => s.id)

    // Échanger les positions
    const temp = nouvelOrdre[index]
    nouvelOrdre[index] = nouvelOrdre[index - 1]
    nouvelOrdre[index - 1] = temp

    setOrdreManuel(nouvelOrdre)
    localStorage.setItem('plan-marathon-ordreManuel', JSON.stringify(nouvelOrdre))
  }

  // Déplacer une séance vers le bas en mode manuel
  const deplacerSeanceBas = (index) => {
    const historiqueTrie = obtenirHistoriqueTrie()
    if (index === historiqueTrie.length - 1) return

    const nouvelOrdre = historiqueTrie.map(s => s.id)

    // Échanger les positions
    const temp = nouvelOrdre[index]
    nouvelOrdre[index] = nouvelOrdre[index + 1]
    nouvelOrdre[index + 1] = temp

    setOrdreManuel(nouvelOrdre)
    localStorage.setItem('plan-marathon-ordreManuel', JSON.stringify(nouvelOrdre))
  }

  // Gérer la sélection d'une séance
  const toggleSelectionSeance = (id) => {
    if (seancesSelectionnees.includes(id)) {
      setSeancesSelectionnees(seancesSelectionnees.filter(seanceId => seanceId !== id))
    } else {
      setSeancesSelectionnees([...seancesSelectionnees, id])
    }
  }

  // Tout sélectionner / Tout désélectionner
  const toggleToutSelectionner = () => {
    if (seancesSelectionnees.length === historique.length) {
      setSeancesSelectionnees([])
    } else {
      setSeancesSelectionnees(historique.map(s => s.id))
    }
  }

  // Exporter des séances en JSON
  const exporterSeances = (seances) => {
    const dataStr = JSON.stringify(seances, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    const date = new Date().toISOString().split('T')[0]
    link.download = `seances-marathon-${date}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Exporter tout l'historique
  const exporterTout = () => {
    exporterSeances(historique)
    alert(`${historique.length} séance(s) exportée(s)`)
  }

  // Exporter la sélection
  const exporterSelection = () => {
    const seancesAExporter = historique.filter(s => seancesSelectionnees.includes(s.id))
    exporterSeances(seancesAExporter)
    alert(`${seancesAExporter.length} séance(s) exportée(s)`)
    setSeancesSelectionnees([])
  }

  // Exporter une seule séance
  const exporterSeanceIndividuelle = (seance) => {
    exporterSeances([seance])
    alert('Séance exportée')
  }

  // Importer des séances
  const importerSeances = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const seancesImportees = JSON.parse(e.target.result)

        // Vérifier que c'est un tableau
        if (!Array.isArray(seancesImportees)) {
          alert('Format de fichier invalide')
          return
        }

        // Détecter les doublons
        const doublons = seancesImportees.filter(seanceImportee =>
          historique.some(s => s.id === seanceImportee.id)
        )

        let seancesAjouter = []

        if (doublons.length > 0) {
          const reponse = confirm(
            `${doublons.length} séance(s) existe(nt) déjà.\n\n` +
            `OK = Remplacer les doublons\n` +
            `Annuler = Créer des copies avec de nouveaux IDs`
          )

          if (reponse) {
            // Remplacer les doublons
            let nouvelHistorique = [...historique]
            seancesImportees.forEach(seanceImportee => {
              const index = nouvelHistorique.findIndex(s => s.id === seanceImportee.id)
              if (index !== -1) {
                nouvelHistorique[index] = seanceImportee
              } else {
                nouvelHistorique.push(seanceImportee)
              }
            })
            setHistorique(nouvelHistorique)
            localStorage.setItem('plan-marathon-historique', JSON.stringify(nouvelHistorique))
            alert(`${seancesImportees.length} séance(s) importée(s) (${doublons.length} remplacée(s))`)
          } else {
            // Créer des copies avec de nouveaux IDs
            seancesAjouter = seancesImportees.map(seance => ({
              ...seance,
              id: Date.now() + Math.random(),
              nom: historique.some(s => s.id === seance.id) ? `Copie de ${seance.nom}` : seance.nom,
              dateCreation: new Date().toISOString()
            }))
            const nouvelHistorique = [...historique, ...seancesAjouter]
            setHistorique(nouvelHistorique)
            localStorage.setItem('plan-marathon-historique', JSON.stringify(nouvelHistorique))
            alert(`${seancesAjouter.length} séance(s) importée(s) (copies créées)`)
          }
        } else {
          // Pas de doublons, ajouter directement
          const nouvelHistorique = [...historique, ...seancesImportees]
          setHistorique(nouvelHistorique)
          localStorage.setItem('plan-marathon-historique', JSON.stringify(nouvelHistorique))
          alert(`${seancesImportees.length} séance(s) importée(s)`)
        }

        // Réinitialiser l'input file
        event.target.value = ''
      } catch (error) {
        alert('Erreur lors de l\'import du fichier')
        console.error(error)
      }
    }
    reader.readAsText(file)
  }

  // Ajouter un nouveau bloc
  const ajouterBloc = () => {
    setBlocs([...blocs, {
      repetitions: 1,
      series: [{
        repetitions: 1,
        typePlage: 'fixe', // 'fixe' ou 'plage'
        pourcentageVMA: '',
        allure: '',
        distance: '',
        temps: '',
        // Pour les plages
        pourcentageVMAMin: '',
        pourcentageVMAMax: '',
        allureMin: '',
        allureMax: '',
        distanceMin: '',
        distanceMax: '',
        tempsMin: '',
        tempsMax: ''
      }]
    }])
  }

  // Supprimer un bloc
  const supprimerBloc = (indexBloc) => {
    setBlocs(blocs.filter((_, i) => i !== indexBloc))
  }

  // Dupliquer un bloc
  const dupliquerBloc = (indexBloc) => {
    const nouveauxBlocs = [...blocs]
    const blocDuplique = JSON.parse(JSON.stringify(blocs[indexBloc]))
    nouveauxBlocs.splice(indexBloc + 1, 0, blocDuplique)
    setBlocs(nouveauxBlocs)
  }

  // Mettre à jour les répétitions d'un bloc
  const updateRepetitionsBloc = (indexBloc, repetitions) => {
    const nouveauxBlocs = [...blocs]
    nouveauxBlocs[indexBloc].repetitions = repetitions
    setBlocs(nouveauxBlocs)
  }

  // Ajouter une série à un bloc
  const ajouterSerie = (indexBloc) => {
    const nouveauxBlocs = [...blocs]
    nouveauxBlocs[indexBloc].series.push({
      repetitions: 1,
      typePlage: 'fixe',
      pourcentageVMA: '',
      allure: '',
      distance: '',
      temps: '',
      pourcentageVMAMin: '',
      pourcentageVMAMax: '',
      allureMin: '',
      allureMax: '',
      distanceMin: '',
      distanceMax: '',
      tempsMin: '',
      tempsMax: ''
    })
    setBlocs(nouveauxBlocs)
  }

  // Supprimer une série d'un bloc
  const supprimerSerie = (indexBloc, indexSerie) => {
    const nouveauxBlocs = [...blocs]
    nouveauxBlocs[indexBloc].series = nouveauxBlocs[indexBloc].series.filter((_, i) => i !== indexSerie)
    setBlocs(nouveauxBlocs)
  }

  // Dupliquer une série
  const dupliquerSerie = (indexBloc, indexSerie) => {
    const nouveauxBlocs = [...blocs]
    const serieDupliquee = JSON.parse(JSON.stringify(nouveauxBlocs[indexBloc].series[indexSerie]))
    nouveauxBlocs[indexBloc].series.splice(indexSerie + 1, 0, serieDupliquee)
    setBlocs(nouveauxBlocs)
  }

  // Convertir VMA et pourcentage en allure (min/km)
  const calculerAllureDepuisVMA = (vma, pourcentage) => {
    if (!vma || !pourcentage) return null
    const vitesseKmH = vma * (pourcentage / 100)
    const minParKm = 60 / vitesseKmH
    return minParKm
  }

  // Convertir allure en VMA et pourcentage (si VMA est connue)
  const calculerPourcentageVMA = (vma, allure) => {
    if (!vma || !allure) return null
    const vitesseKmH = 60 / allure
    const pourcentage = (vitesseKmH / vma) * 100
    return pourcentage
  }

  // Calculer le temps en secondes à partir de distance et allure
  const calculerTemps = (distance, allure) => {
    if (!distance || !allure) return null
    const distanceKm = distance / 1000
    const tempsMinutes = distanceKm * allure
    return tempsMinutes * 60 // convertir en secondes
  }

  // Calculer l'allure à partir de distance et temps
  const calculerAllure = (distance, temps) => {
    if (!distance || !temps) return null
    const distanceKm = distance / 1000
    const tempsMinutes = temps / 60
    return tempsMinutes / distanceKm
  }

  // Parser l'allure au format min:sec/km en minutes décimales
  const parserAllure = (allureStr) => {
    if (!allureStr) return null
    if (allureStr.includes(':')) {
      const parts = allureStr.split(':')
      const min = Number(parts[0])
      const sec = Number(parts[1])
      // Vérifier que les deux parties sont des nombres valides
      if (isNaN(min) || isNaN(sec)) return null
      return min + sec / 60
    }
    const num = Number(allureStr)
    return isNaN(num) ? null : num
  }

  // Formater l'allure en min:sec/km
  const formaterAllure = (allureMinutes) => {
    if (!allureMinutes) return ''
    const minutes = Math.floor(allureMinutes)
    const secondes = Math.round((allureMinutes - minutes) * 60)
    return `${minutes}:${secondes.toString().padStart(2, '0')}`
  }

  // Formater le temps en h:mm:ss ou mm:ss
  const formaterTemps = (tempsSecondes) => {
    if (!tempsSecondes) return ''
    const heures = Math.floor(tempsSecondes / 3600)
    const minutes = Math.floor((tempsSecondes % 3600) / 60)
    const secondes = Math.round(tempsSecondes % 60)

    if (heures > 0) {
      return `${heures}:${minutes.toString().padStart(2, '0')}:${secondes.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secondes.toString().padStart(2, '0')}`
  }

  // Formater le temps pour affichage lisible (avec labels h/min/s)
  const formaterTempsLisible = (tempsStr) => {
    if (!tempsStr) return ''
    const parts = tempsStr.split(':')

    if (parts.length === 3) {
      // Format h:mm:ss
      return `${parts[0]}h${parts[1]}min${parts[2]}s`
    } else if (parts.length === 2) {
      // Format mm:ss
      return `${parts[0]}min${parts[1]}s`
    }
    return tempsStr
  }

  // Parser le temps au format h:mm:ss, mm:ss ou secondes en secondes
  const parserTemps = (tempsStr) => {
    if (!tempsStr) return null
    if (tempsStr.includes(':')) {
      const parts = tempsStr.split(':').map(Number)
      if (parts.length === 3) {
        // Format h:mm:ss
        return parts[0] * 3600 + parts[1] * 60 + parts[2]
      } else if (parts.length === 2) {
        // Format mm:ss
        return parts[0] * 60 + parts[1]
      }
    }
    return Number(tempsStr)
  }

  // Sélectionner tout le texte au focus
  const handleFocus = (event) => {
    event.target.select()
  }

  // Formater automatiquement l'allure pendant la saisie (mm:ss)
  const formatAllureInput = (value) => {
    // Supprimer tout sauf les chiffres
    const numbers = value.replace(/\D/g, '')

    if (numbers.length === 0) return ''
    if (numbers.length <= 2) return numbers

    // Ajouter automatiquement le ":"
    const minutes = numbers.slice(0, -2)
    const secondes = numbers.slice(-2)
    return `${minutes}:${secondes}`
  }

  // Formater automatiquement le temps pendant la saisie (h:mm:ss ou mm:ss)
  const formatTempsInput = (value) => {
    // Supprimer tout sauf les chiffres
    const numbers = value.replace(/\D/g, '')

    if (numbers.length === 0) return ''
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 4) {
      // Format mm:ss
      const minutes = numbers.slice(0, -2)
      const secondes = numbers.slice(-2)
      return `${minutes}:${secondes}`
    }

    // Format h:mm:ss (plus de 4 chiffres)
    const secondes = numbers.slice(-2)
    const minutes = numbers.slice(-4, -2)
    const heures = numbers.slice(0, -4)
    return `${heures}:${minutes}:${secondes}`
  }

  // Mettre à jour une série avec debounce pour les calculs automatiques
  const updateSerieWithDebounce = (indexBloc, indexSerie, field, value, immediate = false) => {
    // Mettre à jour immédiatement la valeur dans l'UI
    const nouveauxBlocs = [...blocs]
    nouveauxBlocs[indexBloc].series[indexSerie][field] = value
    setBlocs(nouveauxBlocs)

    // Si immediate est true, calculer tout de suite
    if (immediate) {
      updateSerie(indexBloc, indexSerie, field, value)
      return
    }

    // Sinon, attendre 500ms après la dernière frappe
    const key = `${indexBloc}-${indexSerie}-${field}`

    if (typingTimeouts[key]) {
      clearTimeout(typingTimeouts[key])
    }

    const timeoutId = setTimeout(() => {
      updateSerie(indexBloc, indexSerie, field, value)
    }, 500)

    setTypingTimeouts({ ...typingTimeouts, [key]: timeoutId })
  }

  // Mettre à jour une série
  const updateSerie = (indexBloc, indexSerie, field, value) => {
    const nouveauxBlocs = [...blocs]
    const serieOriginale = nouveauxBlocs[indexBloc].series[indexSerie]
    const serie = { ...serieOriginale }

    // Si le type de plage change
    if (field === 'typePlage') {
      serie.typePlage = value
    }

    // Si répétitions changent
    if (field === 'repetitions') {
      serie.repetitions = value
    }

    // MODE FIXE
    // Si VMA ou pourcentage VMA changent
    if (field === 'pourcentageVMA') {
      serie.pourcentageVMA = value
      const allure = calculerAllureDepuisVMA(vma, value)
      if (allure) {
        serie.allure = formaterAllure(allure)
        if (serie.distance) {
          const temps = calculerTemps(serie.distance, allure)
          serie.temps = temps ? formaterTemps(temps) : ''
        }
      }
    }

    // Si allure change
    if (field === 'allure') {
      serie.allure = value
      const allureMinutes = parserAllure(value)
      if (vma && allureMinutes) {
        const pourcentage = calculerPourcentageVMA(vma, allureMinutes)
        const pourcentageArrondi = Math.round(pourcentage / 5) * 5
        serie.pourcentageVMA = pourcentageArrondi
      }
      if (serie.distance && allureMinutes) {
        const temps = calculerTemps(serie.distance, allureMinutes)
        serie.temps = temps ? formaterTemps(temps) : ''
      }
      // Si on a le temps mais pas la distance, calculer la distance
      if (!serie.distance && serie.temps && allureMinutes) {
        const tempsSecondes = parserTemps(serie.temps)
        if (tempsSecondes) {
          const tempsMinutes = tempsSecondes / 60
          const distanceKm = tempsMinutes / allureMinutes
          serie.distance = Math.round(distanceKm * 1000) // convertir en mètres
        }
      }
    }

    // Si temps change
    if (field === 'temps') {
      serie.temps = value
      const tempsSecondes = parserTemps(value)
      if (serie.distance && tempsSecondes) {
        const allure = calculerAllure(serie.distance, tempsSecondes)
        if (allure) {
          serie.allure = formaterAllure(allure)
          if (vma) {
            const pourcentage = calculerPourcentageVMA(vma, allure)
            const pourcentageArrondi = Math.round(pourcentage / 5) * 5
            serie.pourcentageVMA = pourcentageArrondi
          }
        }
      }
      // Si on a l'allure mais pas la distance, calculer la distance
      if (!serie.distance && serie.allure && tempsSecondes) {
        const allureMinutes = parserAllure(serie.allure)
        if (allureMinutes) {
          const tempsMinutes = tempsSecondes / 60
          const distanceKm = tempsMinutes / allureMinutes
          serie.distance = Math.round(distanceKm * 1000) // convertir en mètres
        }
      }
    }

    // MODE PLAGE
    // Si pourcentage VMA min change
    if (field === 'pourcentageVMAMin') {
      serie.pourcentageVMAMin = value
      const allure = calculerAllureDepuisVMA(vma, value)
      if (allure) {
        serie.allureMin = formaterAllure(allure)
        const distance = parseFloat(serie.distanceMin || serie.distance)
        if (distance) {
          const temps = calculerTemps(distance, allure)
          serie.tempsMin = temps ? formaterTemps(temps) : ''
        }
      }
    }

    // Si pourcentage VMA max change
    if (field === 'pourcentageVMAMax') {
      serie.pourcentageVMAMax = value
      const allure = calculerAllureDepuisVMA(vma, value)
      if (allure) {
        serie.allureMax = formaterAllure(allure)
        const distance = parseFloat(serie.distanceMax || serie.distance)
        if (distance) {
          const temps = calculerTemps(distance, allure)
          serie.tempsMax = temps ? formaterTemps(temps) : ''
        }
      }
    }

    // Si allure min change
    if (field === 'allureMin') {
      serie.allureMin = value
      const allureMinutes = parserAllure(value)
      if (vma && allureMinutes) {
        const pourcentage = calculerPourcentageVMA(vma, allureMinutes)
        const pourcentageArrondi = Math.round(pourcentage / 5) * 5
        serie.pourcentageVMAMin = pourcentageArrondi
      }
      const distance = parseFloat(serie.distanceMin || serie.distance)
      if (distance && allureMinutes) {
        const temps = calculerTemps(distance, allureMinutes)
        serie.tempsMin = temps ? formaterTemps(temps) : ''
      }
      // Si on a le temps mais pas la distance, calculer la distance
      if (!serie.distanceMin && !serie.distance && serie.tempsMin && allureMinutes) {
        const tempsSecondes = parserTemps(serie.tempsMin)
        if (tempsSecondes) {
          const tempsMinutes = tempsSecondes / 60
          const distanceKm = tempsMinutes / allureMinutes
          serie.distanceMin = Math.round(distanceKm * 1000)
        }
      }
    }

    // Si allure max change
    if (field === 'allureMax') {
      serie.allureMax = value
      const allureMinutes = parserAllure(value)
      if (vma && allureMinutes) {
        const pourcentage = calculerPourcentageVMA(vma, allureMinutes)
        const pourcentageArrondi = Math.round(pourcentage / 5) * 5
        serie.pourcentageVMAMax = pourcentageArrondi
      }
      const distance = parseFloat(serie.distanceMax || serie.distance)
      if (distance && allureMinutes) {
        const temps = calculerTemps(distance, allureMinutes)
        serie.tempsMax = temps ? formaterTemps(temps) : ''
      }
      // Si on a le temps mais pas la distance, calculer la distance
      if (!serie.distanceMax && !serie.distance && serie.tempsMax && allureMinutes) {
        const tempsSecondes = parserTemps(serie.tempsMax)
        if (tempsSecondes) {
          const tempsMinutes = tempsSecondes / 60
          const distanceKm = tempsMinutes / allureMinutes
          serie.distanceMax = Math.round(distanceKm * 1000)
        }
      }
    }

    // Si temps min change
    if (field === 'tempsMin') {
      serie.tempsMin = value
      const tempsSecondes = parserTemps(value)
      const distance = parseFloat(serie.distanceMin || serie.distance)
      if (distance && tempsSecondes) {
        const allure = calculerAllure(distance, tempsSecondes)
        if (allure) {
          serie.allureMin = formaterAllure(allure)
          if (vma) {
            const pourcentage = calculerPourcentageVMA(vma, allure)
            const pourcentageArrondi = Math.round(pourcentage / 5) * 5
            serie.pourcentageVMAMin = pourcentageArrondi
          }
        }
      }
      // Si on a l'allure mais pas la distance, calculer la distance
      if (!serie.distanceMin && !serie.distance && serie.allureMin && tempsSecondes) {
        const allureMinutes = parserAllure(serie.allureMin)
        if (allureMinutes) {
          const tempsMinutes = tempsSecondes / 60
          const distanceKm = tempsMinutes / allureMinutes
          serie.distanceMin = Math.round(distanceKm * 1000)
        }
      }
    }

    // Si temps max change
    if (field === 'tempsMax') {
      serie.tempsMax = value
      const tempsSecondes = parserTemps(value)
      const distance = parseFloat(serie.distanceMax || serie.distance)
      if (distance && tempsSecondes) {
        const allure = calculerAllure(distance, tempsSecondes)
        if (allure) {
          serie.allureMax = formaterAllure(allure)
          if (vma) {
            const pourcentage = calculerPourcentageVMA(vma, allure)
            const pourcentageArrondi = Math.round(pourcentage / 5) * 5
            serie.pourcentageVMAMax = pourcentageArrondi
          }
        }
      }
      // Si on a l'allure mais pas la distance, calculer la distance
      if (!serie.distanceMax && !serie.distance && serie.allureMax && tempsSecondes) {
        const allureMinutes = parserAllure(serie.allureMax)
        if (allureMinutes) {
          const tempsMinutes = tempsSecondes / 60
          const distanceKm = tempsMinutes / allureMinutes
          serie.distanceMax = Math.round(distanceKm * 1000)
        }
      }
    }

    // Si distance min change
    if (field === 'distanceMin') {
      serie.distanceMin = value
      const allureMinutes = parserAllure(serie.allureMin)
      if (allureMinutes) {
        const temps = calculerTemps(value, allureMinutes)
        serie.tempsMin = temps ? formaterTemps(temps) : ''
      }
    }

    // Si distance max change
    if (field === 'distanceMax') {
      serie.distanceMax = value
      const allureMinutes = parserAllure(serie.allureMax)
      if (allureMinutes) {
        const temps = calculerTemps(value, allureMinutes)
        serie.tempsMax = temps ? formaterTemps(temps) : ''
      }
    }

    // Si distance change
    if (field === 'distance') {
      serie.distance = value
      if (serie.typePlage === 'fixe') {
        const allureMinutes = parserAllure(serie.allure)
        if (allureMinutes) {
          const temps = calculerTemps(value, allureMinutes)
          serie.temps = temps ? formaterTemps(temps) : ''
        }
      } else {
        // En mode plage, remplir min et max si vides OU si elles suivaient la valeur principale
        const ancienneDistance = serieOriginale.distance
        if (!serie.distanceMin || serie.distanceMin === ancienneDistance) {
          serie.distanceMin = value
        }
        if (!serie.distanceMax || serie.distanceMax === ancienneDistance) {
          serie.distanceMax = value
        }
        // Recalculer les temps avec les allures si elles existent
        const allureMinMinutes = parserAllure(serie.allureMin)
        if (allureMinMinutes && value) {
          const distanceMin = parseFloat(serie.distanceMin || value)
          const temps = calculerTemps(distanceMin, allureMinMinutes)
          serie.tempsMin = temps ? formaterTemps(temps) : ''
        }
        const allureMaxMinutes = parserAllure(serie.allureMax)
        if (allureMaxMinutes && value) {
          const distanceMax = parseFloat(serie.distanceMax || value)
          const temps = calculerTemps(distanceMax, allureMaxMinutes)
          serie.tempsMax = temps ? formaterTemps(temps) : ''
        }
      }
    }

    // Si temps principal change en mode plage
    if (field === 'temps' && serie.typePlage === 'plage') {
      serie.temps = value
      // Remplir min et max si vides OU si elles suivaient la valeur principale
      const ancienTemps = serieOriginale.temps
      if (!serie.tempsMin || serie.tempsMin === ancienTemps) {
        serie.tempsMin = value
      }
      if (!serie.tempsMax || serie.tempsMax === ancienTemps) {
        serie.tempsMax = value
      }

      const tempsSecondes = parserTemps(value)
      if (tempsSecondes) {
        // Calculer avec distance min si elle existe
        if (serie.distanceMin || serie.distance) {
          const distance = parseFloat(serie.distanceMin || serie.distance)
          const allure = calculerAllure(distance, tempsSecondes)
          if (allure) {
            serie.allureMin = formaterAllure(allure)
            if (vma) {
              const pourcentage = calculerPourcentageVMA(vma, allure)
              serie.pourcentageVMAMin = Math.round(pourcentage / 5) * 5
            }
          }
        }
        // Calculer avec distance max si elle existe
        if (serie.distanceMax || serie.distance) {
          const distance = parseFloat(serie.distanceMax || serie.distance)
          const allure = calculerAllure(distance, tempsSecondes)
          if (allure) {
            serie.allureMax = formaterAllure(allure)
            if (vma) {
              const pourcentage = calculerPourcentageVMA(vma, allure)
              serie.pourcentageVMAMax = Math.round(pourcentage / 5) * 5
            }
          }
        }
      }
    }

    nouveauxBlocs[indexBloc].series[indexSerie] = serie
    setBlocs(nouveauxBlocs)
  }

  // Calculer le total
  const calculerDistanceTotale = () => {
    return blocs.reduce((total, bloc) => {
      const repetitionsBloc = parseInt(bloc.repetitions) || 1
      return total + bloc.series.reduce((sousTotal, serie) => {
        const repetitionsSerie = parseInt(serie.repetitions) || 1
        const distance = parseFloat(serie.distance) || 0
        return sousTotal + (distance * repetitionsSerie * repetitionsBloc)
      }, 0)
    }, 0)
  }

  // Sauvegarder la séance (création ou mise à jour)
  const sauvegarderSeance = () => {
    if (!nomSeance.trim()) {
      alert('Veuillez donner un nom à la séance')
      return
    }

    // Si on est en mode édition, mettre à jour au lieu de créer
    if (seanceEnCoursEdition) {
      mettreAJourSeance()
    } else {
      // Création d'une nouvelle séance
      sauvegarderHistorique({ nom: nomSeance, vma, blocs, dateSeance })
      alert('Séance sauvegardée !')
      // Réinitialiser le formulaire après sauvegarde
      setNomSeance('')
      setVma('')
      setBlocs([])
      setDateSeance('')
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
      <div className="app">
        <h1>Plan Marathon - Calculateur d'allures</h1>

        <div className="top-section">
          <TextField
            label="Nom de la séance"
            value={nomSeance}
            onChange={(e) => setNomSeance(e.target.value)}
            placeholder="Ex: Séance VMA"
            size="small"
            fullWidth
          />
          <DatePicker
            label="Date de la séance"
            value={dateSeance ? dayjs(dateSeance) : null}
            onChange={(newValue) => setDateSeance(newValue ? newValue.format('YYYY-MM-DD') : '')}
            slotProps={{
              textField: {
                size: 'small',
                sx: { width: '180px' }
              }
            }}
          />
          <TextField
            label="VMA"
            type="number"
            value={vma}
            onChange={(e) => setVma(e.target.value)}
            onFocus={handleFocus}
            placeholder="Ex: 16"
            size="small"
            sx={{ width: '150px' }}
            inputProps={{ step: 0.1 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">km/h</InputAdornment>
            }}
          />
          <button className="btn-primary" onClick={ajouterBloc} style={{ width: '170px' }}>+ Ajouter un bloc</button>
          {seanceEnCoursEdition && (
            <button className="btn-secondary" onClick={annulerEdition}>Annuler</button>
          )}
          <button className="btn-success" onClick={sauvegarderSeance} disabled={blocs.length === 0}>
            {seanceEnCoursEdition ? 'Mettre à jour' : 'Sauvegarder'}
          </button>
        </div>

      {blocs.map((bloc, indexBloc) => (
        <div key={indexBloc} className="bloc-container">
          <div className="bloc-header">
            <div className="bloc-title">
              <h2>Bloc {indexBloc + 1}</h2>
              <TextField
                label="Répétitions du bloc"
                type="number"
                value={bloc.repetitions}
                onChange={(e) => updateRepetitionsBloc(indexBloc, e.target.value)}
                onFocus={handleFocus}
                size="small"
                inputProps={{ min: 1 }}
                sx={{ width: '150px' }}
              />
            </div>
            <div className="bloc-actions">
              <button className="btn-secondary" onClick={() => ajouterSerie(indexBloc)}>+ Série</button>
              <button className="btn-secondary" onClick={() => dupliquerBloc(indexBloc)}>Dupliquer</button>
              <button className="btn-danger" onClick={() => supprimerBloc(indexBloc)}>Supprimer</button>
            </div>
          </div>

          {bloc.series.map((serie, indexSerie) => (
            <div key={indexSerie} className="serie-row">
              <div className="serie-header">
                <div className="serie-title">
                  <span>Série {indexSerie + 1}</span>
                  <TextField
                    label="Répétitions"
                    type="number"
                    value={serie.repetitions}
                    onChange={(e) => updateSerie(indexBloc, indexSerie, 'repetitions', e.target.value)}
                    onFocus={handleFocus}
                    size="small"
                    inputProps={{ min: 1 }}
                    sx={{ width: '120px' }}
                  />
                </div>
                <div className="serie-actions">
                  <button className="btn-small-secondary" onClick={() => dupliquerSerie(indexBloc, indexSerie)}>⎘</button>
                  {bloc.series.length > 1 && (
                    <button className="btn-small-danger" onClick={() => supprimerSerie(indexBloc, indexSerie)}>×</button>
                  )}
                </div>
              </div>
              <div className="serie-type-selector">
                <label>
                  <input
                    type="radio"
                    name={`type-${indexBloc}-${indexSerie}`}
                    value="fixe"
                    checked={serie.typePlage === 'fixe'}
                    onChange={(e) => updateSerie(indexBloc, indexSerie, 'typePlage', e.target.value)}
                  />
                  Allure fixe
                </label>
                <label>
                  <input
                    type="radio"
                    name={`type-${indexBloc}-${indexSerie}`}
                    value="plage"
                    checked={serie.typePlage === 'plage'}
                    onChange={(e) => updateSerie(indexBloc, indexSerie, 'typePlage', e.target.value)}
                  />
                  Plage d'allures
                </label>
              </div>

              {serie.typePlage === 'plage' && (
                <Box className="distance-field" sx={{ p: 2, mb: 2, bgcolor: 'white', borderRadius: 1 }}>
                  <TextField
                    label="Distance principale (optionnel)"
                    type="number"
                    value={serie.distance}
                    onChange={(e) => updateSerie(indexBloc, indexSerie, 'distance', e.target.value)}
                    onFocus={handleFocus}
                    placeholder="400"
                    size="small"
                    fullWidth
                    helperText="Rempli automatiquement min et max si vides"
                    sx={{ mb: 2 }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">m</InputAdornment>
                    }}
                  />
                  <TextField
                    label="Temps principal (optionnel)"
                    value={serie.temps}
                    onChange={(e) => {
                      const formatted = formatTempsInput(e.target.value)
                      updateSerieWithDebounce(indexBloc, indexSerie, 'temps', formatted)
                    }}
                    onFocus={handleFocus}
                    placeholder="12345"
                    size="small"
                    fullWidth
                    helperText="Rempli automatiquement min et max si vides"
                  />
                </Box>
              )}

              {serie.typePlage === 'fixe' ? (
                <Box className="serie-fields" sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    label="Distance"
                    type="number"
                    value={serie.distance}
                    onChange={(e) => updateSerie(indexBloc, indexSerie, 'distance', e.target.value)}
                    onFocus={handleFocus}
                    placeholder="400"
                    size="small"
                    sx={{ width: '120px' }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">m</InputAdornment>
                    }}
                  />
                  <TextField
                    label="VMA"
                    type="number"
                    value={serie.pourcentageVMA}
                    onChange={(e) => updateSerie(indexBloc, indexSerie, 'pourcentageVMA', e.target.value)}
                    onFocus={handleFocus}
                    placeholder="85"
                    size="small"
                    disabled={!vma}
                    inputProps={{ step: 5 }}
                    sx={{ width: '100px' }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                  />
                  <TextField
                    label="Allure"
                    value={serie.allure}
                    onChange={(e) => {
                      const formatted = formatAllureInput(e.target.value)
                      updateSerieWithDebounce(indexBloc, indexSerie, 'allure', formatted)
                    }}
                    onFocus={handleFocus}
                    placeholder="530"
                    size="small"
                    sx={{ width: '140px' }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">min/km</InputAdornment>
                    }}
                  />
                  <TextField
                    label="Temps"
                    value={serie.temps}
                    onChange={(e) => {
                      const formatted = formatTempsInput(e.target.value)
                      updateSerieWithDebounce(indexBloc, indexSerie, 'temps', formatted)
                    }}
                    onFocus={handleFocus}
                    placeholder="12345"
                    size="small"
                    sx={{ width: '150px' }}
                  />
                </Box>
              ) : (
                <Box className="serie-fields-plage" sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box className="plage-group" sx={{ bgcolor: 'white', p: 2, borderRadius: 1, border: '2px solid #dee2e6' }}>
                    <Box className="plage-label" sx={{ fontWeight: 700, color: '#495057', mb: 1.5, fontSize: '1rem', textAlign: 'center', pb: 1, borderBottom: '2px solid #e9ecef' }}>
                      Min
                    </Box>
                    <TextField
                      label="Distance"
                      type="number"
                      value={serie.distanceMin}
                      onChange={(e) => updateSerie(indexBloc, indexSerie, 'distanceMin', e.target.value)}
                      onFocus={handleFocus}
                      placeholder="400"
                      size="small"
                      fullWidth
                      helperText="Optionnel si différent"
                      sx={{ mb: 2 }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">m</InputAdornment>
                      }}
                    />
                    <TextField
                      label="VMA"
                      type="number"
                      value={serie.pourcentageVMAMin}
                      onChange={(e) => updateSerie(indexBloc, indexSerie, 'pourcentageVMAMin', e.target.value)}
                      onFocus={handleFocus}
                      placeholder="80"
                      size="small"
                      fullWidth
                      disabled={!vma}
                      inputProps={{ step: 5 }}
                      sx={{ mb: 2 }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>
                      }}
                    />
                    <TextField
                      label="Allure"
                      value={serie.allureMin}
                      onChange={(e) => {
                        const formatted = formatAllureInput(e.target.value)
                        updateSerieWithDebounce(indexBloc, indexSerie, 'allureMin', formatted)
                      }}
                      onFocus={handleFocus}
                      placeholder="500"
                      size="small"
                      fullWidth
                      sx={{ mb: 2 }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">min/km</InputAdornment>
                      }}
                    />
                    <TextField
                      label="Temps"
                      value={serie.tempsMin}
                      onChange={(e) => {
                        const formatted = formatTempsInput(e.target.value)
                        updateSerieWithDebounce(indexBloc, indexSerie, 'tempsMin', formatted)
                      }}
                      onFocus={handleFocus}
                      placeholder="12345"
                      size="small"
                      fullWidth
                    />
                  </Box>
                  <Box className="plage-group" sx={{ bgcolor: 'white', p: 2, borderRadius: 1, border: '2px solid #dee2e6' }}>
                    <Box className="plage-label" sx={{ fontWeight: 700, color: '#495057', mb: 1.5, fontSize: '1rem', textAlign: 'center', pb: 1, borderBottom: '2px solid #e9ecef' }}>
                      Max
                    </Box>
                    <TextField
                      label="Distance"
                      type="number"
                      value={serie.distanceMax}
                      onChange={(e) => updateSerie(indexBloc, indexSerie, 'distanceMax', e.target.value)}
                      onFocus={handleFocus}
                      placeholder="450"
                      size="small"
                      fullWidth
                      helperText="Optionnel si différent"
                      sx={{ mb: 2 }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">m</InputAdornment>
                      }}
                    />
                    <TextField
                      label="VMA"
                      type="number"
                      value={serie.pourcentageVMAMax}
                      onChange={(e) => updateSerie(indexBloc, indexSerie, 'pourcentageVMAMax', e.target.value)}
                      onFocus={handleFocus}
                      placeholder="90"
                      size="small"
                      fullWidth
                      disabled={!vma}
                      inputProps={{ step: 5 }}
                      sx={{ mb: 2 }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>
                      }}
                    />
                    <TextField
                      label="Allure"
                      value={serie.allureMax}
                      onChange={(e) => {
                        const formatted = formatAllureInput(e.target.value)
                        updateSerieWithDebounce(indexBloc, indexSerie, 'allureMax', formatted)
                      }}
                      onFocus={handleFocus}
                      placeholder="530"
                      size="small"
                      fullWidth
                      sx={{ mb: 2 }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">min/km</InputAdornment>
                      }}
                    />
                    <TextField
                      label="Temps"
                      value={serie.tempsMax}
                      onChange={(e) => {
                        const formatted = formatTempsInput(e.target.value)
                        updateSerieWithDebounce(indexBloc, indexSerie, 'tempsMax', formatted)
                      }}
                      onFocus={handleFocus}
                      placeholder="12345"
                      size="small"
                      fullWidth
                    />
                  </Box>
                </Box>
              )}
            </div>
          ))}
        </div>
      ))}

      {blocs.length > 0 && (
        <div className="summary">
          <h2>Résumé de la séance</h2>
          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-label">Distance totale</div>
              <div className="summary-value">{(calculerDistanceTotale() / 1000).toFixed(2)} km</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Nombre de blocs</div>
              <div className="summary-value">{blocs.length}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Types de séries</div>
              <div className="summary-value">{blocs.reduce((total, bloc) => total + bloc.series.length, 0)}</div>
            </div>
          </div>
          <div className="summary-details">
            {blocs.map((bloc, indexBloc) => {
              const repetitionsBloc = parseInt(bloc.repetitions) || 1
              return (
                <div key={indexBloc} className="summary-bloc">
                  <div className="summary-bloc-title">
                    Bloc {indexBloc + 1} {repetitionsBloc > 1 && `(×${repetitionsBloc})`}
                  </div>
                  <div className="summary-series-list">
                    {bloc.series.map((serie, indexSerie) => {
                      const repetitionsSerie = parseInt(serie.repetitions) || 1
                      const distance = parseFloat(serie.distance) || 0
                      const distanceTotale = distance * repetitionsSerie * repetitionsBloc

                      if (serie.typePlage === 'plage') {
                        const distanceMin = parseFloat(serie.distanceMin || serie.distance) || 0
                        const distanceMax = parseFloat(serie.distanceMax || serie.distance) || 0
                        const distanceTotaleMin = distanceMin * repetitionsSerie * repetitionsBloc
                        const distanceTotaleMax = distanceMax * repetitionsSerie * repetitionsBloc

                        return (
                          <div key={indexSerie} className="summary-serie-item summary-serie-plage">
                            <span className="summary-serie-count">{repetitionsSerie}×</span>
                            {serie.distanceMin && serie.distanceMax ? (
                              <span className="summary-serie-distance">{distanceMin}m - {distanceMax}m</span>
                            ) : (
                              <span className="summary-serie-distance">{distance}m</span>
                            )}
                            {serie.allureMin && serie.allureMax && (
                              <span className="summary-serie-allure">
                                @ {serie.allureMin} - {serie.allureMax}/km
                              </span>
                            )}
                            {serie.pourcentageVMAMin && serie.pourcentageVMAMax && (
                              <span className="summary-serie-vma">({serie.pourcentageVMAMin}% - {serie.pourcentageVMAMax}% VMA)</span>
                            )}
                            {serie.tempsMin && serie.tempsMax && (
                              <span className="summary-serie-temps">en {formaterTempsLisible(serie.tempsMin)} - {formaterTempsLisible(serie.tempsMax)}</span>
                            )}
                            {serie.distanceMin && serie.distanceMax ? (
                              <span className="summary-serie-total">= {(distanceTotaleMin / 1000).toFixed(2)} - {(distanceTotaleMax / 1000).toFixed(2)}km</span>
                            ) : (
                              <span className="summary-serie-total">= {(distanceTotale / 1000).toFixed(2)}km</span>
                            )}
                          </div>
                        )
                      }

                      return (
                        <div key={indexSerie} className="summary-serie-item">
                          <span className="summary-serie-count">{repetitionsSerie}×</span>
                          <span className="summary-serie-distance">{distance}m</span>
                          {serie.allure && (
                            <span className="summary-serie-allure">
                              @ {serie.allure}/km
                            </span>
                          )}
                          {serie.pourcentageVMA && (
                            <span className="summary-serie-vma">({serie.pourcentageVMA}% VMA)</span>
                          )}
                          {serie.temps && (
                            <span className="summary-serie-temps">en {formaterTempsLisible(serie.temps)}</span>
                          )}
                          <span className="summary-serie-total">= {(distanceTotale / 1000).toFixed(2)}km</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="historique-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Historique des séances</h2>
          {historique.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="tri-label">Trier par</InputLabel>
              <Select
                labelId="tri-label"
                value={typeTri}
                label="Trier par"
                onChange={(e) => changerTypeTri(e.target.value)}
              >
                <MenuItem value="dateCreation">Date de création</MenuItem>
                <MenuItem value="dateSeance">Date de séance</MenuItem>
                <MenuItem value="manuel">Ordre manuel</MenuItem>
              </Select>
            </FormControl>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {historique.length > 0 && (
            <>
              <button className="btn-secondary" onClick={toggleToutSelectionner}>
                {seancesSelectionnees.length === historique.length ? 'Tout désélectionner' : 'Tout sélectionner'}
              </button>
              <button className="btn-primary" onClick={exporterTout}>
                Exporter tout
              </button>
              {seancesSelectionnees.length > 0 && (
                <button className="btn-primary" onClick={exporterSelection}>
                  Exporter la sélection ({seancesSelectionnees.length})
                </button>
              )}
            </>
          )}
          <label htmlFor="import-file" style={{ margin: 0 }}>
            <input
              id="import-file"
              type="file"
              accept=".json"
              onChange={importerSeances}
              style={{ display: 'none' }}
            />
            <button className="btn-success" onClick={() => document.getElementById('import-file').click()}>
              Importer
            </button>
          </label>
        </div>

        {historique.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d', fontStyle: 'italic' }}>
            Aucune séance enregistrée. Créez votre première séance ou importez des séances existantes.
          </div>
        ) : (
          obtenirHistoriqueTrie().map((seance, index) => (
            <div key={seance.id} className="historique-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                <Checkbox
                  checked={seancesSelectionnees.includes(seance.id)}
                  onChange={() => toggleSelectionSeance(seance.id)}
                  size="small"
                />
                <div className="historique-info">
                  <strong>{seance.nom}</strong>
                  {seance.dateSeance && (
                    <span className="date-seance">📅 {new Date(seance.dateSeance).toLocaleDateString('fr-FR')}</span>
                  )}
                  <span className="date-creation">Créée le {new Date(seance.dateCreation).toLocaleDateString('fr-FR')}</span>
                  <span>VMA: {seance.vma} km/h</span>
                  <span>{seance.blocs.length} bloc(s)</span>
                </div>
              </div>
              <div className="historique-actions">
                {typeTri === 'manuel' && (
                  <>
                    <Tooltip title="Déplacer vers le haut">
                      <span>
                        <IconButton
                          onClick={() => deplacerSeanceHaut(index)}
                          disabled={index === 0}
                          size="small"
                          color="primary"
                        >
                          <ArrowUpwardIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Déplacer vers le bas">
                      <span>
                        <IconButton
                          onClick={() => deplacerSeanceBas(index)}
                          disabled={index === obtenirHistoriqueTrie().length - 1}
                          size="small"
                          color="primary"
                        >
                          <ArrowDownwardIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </>
                )}
                <Tooltip title="Exporter cette séance">
                  <IconButton
                    onClick={() => exporterSeanceIndividuelle(seance)}
                    size="small"
                    color="default"
                  >
                    <FileDownloadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Dupliquer">
                  <IconButton
                    onClick={() => dupliquerSeanceHistorique(seance)}
                    size="small"
                    color="default"
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Modifier">
                  <IconButton
                    onClick={() => modifierSeance(seance)}
                    size="small"
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Supprimer">
                  <IconButton
                    onClick={() => supprimerSeance(seance.id)}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          ))
        )}
      </div>
      </div>
    </LocalizationProvider>
  )
}

export default App
