import { useState, useEffect, useRef, useCallback } from 'react'
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
import RefreshIcon from '@mui/icons-material/Refresh'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun'
import HotelIcon from '@mui/icons-material/Hotel'
import EventIcon from '@mui/icons-material/Event'
import CommentIcon from '@mui/icons-material/Comment'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import SummarizeIcon from '@mui/icons-material/Summarize'
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
  const [commentaireSeance, setCommentaireSeance] = useState('')
  const [seanceEnCoursEdition, setSeanceEnCoursEdition] = useState(null)
  const [typeTri, setTypeTri] = useState('dateCreation') // 'dateSeance', 'dateCreation', 'manuel'
  const [ordreManuel, setOrdreManuel] = useState([]) // Tableau d'IDs pour l'ordre manuel
  const [seancesSelectionnees, setSeancesSelectionnees] = useState([]) // IDs des séances sélectionnées
  const [seancesDetailsOuvertes, setSeancesDetailsOuvertes] = useState([]) // IDs des séances avec détails affichés
  const [allureMarathon, setAllureMarathon] = useState('') // Allure marathon en min/km (format "5:30")
  const [tempsMarathon, setTempsMarathon] = useState('') // Temps marathon en h:mm:ss
  const [allureSemiMarathon, setAllureSemiMarathon] = useState('') // Allure semi-marathon en min/km (format "5:00")
  const [tempsSemiMarathon, setTempsSemiMarathon] = useState('') // Temps semi-marathon en h:mm:ss

  // Référence vers le bloc résumé pour pouvoir scroller vers lui
  const resumeRef = useRef(null)

  // Décoder les données de la séance depuis l'URL
  const decoderSeanceDepuisURL = (donneesEncodees) => {
    try {
      const donneesJSON = decodeURIComponent(atob(donneesEncodees))
      const seance = JSON.parse(donneesJSON)
      return seance
    } catch (error) {
      console.error('Erreur lors du décodage de la séance:', error)
      return null
    }
  }

  // Charger une séance depuis l'URL
  const chargerSeanceDepuisURL = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const seanceEncodee = urlParams.get('s') || urlParams.get('seance') // Support des deux formats pour rétrocompatibilité
    
    if (seanceEncodee) {
      const seance = decoderSeanceDepuisURL(seanceEncodee)
      if (seance) {
        // Charger les données dans l'interface
        setNomSeance(seance.nom || '')
        setDateSeance(seance.dateSeance || '')
        setCommentaireSeance(seance.commentaire || '')
        if (seance.vma) setVma(seance.vma)
        if (seance.allureMarathon) setAllureMarathon(seance.allureMarathon)
        setBlocs(seance.blocs || [])
        
        // Si l'URL contient une ancre #resume, scroller vers le résumé après un délai
        if (window.location.hash === '#resume') {
          setTimeout(() => {
            const resumeElement = document.getElementById('resume')
            if (resumeElement) {
              resumeElement.scrollIntoView({ behavior: 'smooth' })
            }
          }, 100)
        }
        
        // Nettoyer l'URL (garder l'ancre si elle existe)
        const newUrl = window.location.hash ? 
          window.location.pathname + window.location.hash : 
          window.location.pathname
        window.history.replaceState({}, document.title, newUrl)
        
        return true
      }
    }
    return false
  }, [setNomSeance, setDateSeance, setCommentaireSeance, setVma, setAllureMarathon, setBlocs])

  // Charger l'historique depuis localStorage au démarrage
  useEffect(() => {
    // D'abord, essayer de charger une séance depuis l'URL
    const seanceChargeeDepuisURL = chargerSeanceDepuisURL()
    
    // Ensuite, charger l'historique et les préférences
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

    // Charger VMA seulement si aucune séance n'a été chargée depuis l'URL
    if (!seanceChargeeDepuisURL) {
      const vmaStocke = localStorage.getItem('plan-marathon-vma')
      if (vmaStocke) {
        setVma(vmaStocke)
      }
    }

    // Charger allure et temps marathon
    const allureMarathonStocke = localStorage.getItem('plan-marathon-allureMarathon')
    if (allureMarathonStocke) {
      setAllureMarathon(allureMarathonStocke)
    }

    const tempsMarathonStocke = localStorage.getItem('plan-marathon-tempsMarathon')
    if (tempsMarathonStocke) {
      setTempsMarathon(tempsMarathonStocke)
    }

    // Charger allure et temps semi-marathon
    const allureSemiMarathonStocke = localStorage.getItem('plan-marathon-allureSemiMarathon')
    if (allureSemiMarathonStocke) {
      setAllureSemiMarathon(allureSemiMarathonStocke)
    }

    const tempsSemiMarathonStocke = localStorage.getItem('plan-marathon-tempsSemiMarathon')
    if (tempsSemiMarathonStocke) {
      setTempsSemiMarathon(tempsSemiMarathonStocke)
    }
  }, [chargerSeanceDepuisURL])

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
    setCommentaireSeance(seance.commentaire || '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Voir le résumé d'une séance (mode lecture seule)
  const voirResumeSeance = (seance) => {
    // Charger les données SANS mettre seanceEnCoursEdition (mode aperçu)
    setVma(seance.vma || '')
    setBlocs(JSON.parse(JSON.stringify(seance.blocs))) // Deep copy
    setNomSeance(`${seance.nom} (Aperçu)`)
    setDateSeance(seance.dateSeance || '')
    setCommentaireSeance(seance.commentaire || '')

    // Scroller vers le résumé après un court délai pour laisser le temps au rendu
    setTimeout(() => {
      resumeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
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
        ? { ...s, nom: nomSeance, vma, blocs, dateSeance, commentaire: commentaireSeance }
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
    setCommentaireSeance('')
    alert('Séance mise à jour !')
  }

  // Annuler l'édition
  const annulerEdition = () => {
    setSeanceEnCoursEdition(null)
    setNomSeance('')
    setVma('')
    setBlocs([])
    setDateSeance('')
    setCommentaireSeance('')
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

  // Toggle l'affichage des détails d'une séance
  const toggleDetailsSeance = (id) => {
    if (seancesDetailsOuvertes.includes(id)) {
      setSeancesDetailsOuvertes(seancesDetailsOuvertes.filter(seanceId => seanceId !== id))
    } else {
      setSeancesDetailsOuvertes([...seancesDetailsOuvertes, id])
    }
  }

  // Calculer la distance totale d'une séance
  const calculerDistanceTotaleSeance = (seance) => {
    let distanceMin = 0
    let distanceMax = 0
    let haPlage = false

    seance.blocs.forEach(bloc => {
      const repetitionsBloc = parseInt(bloc.repetitions) || 1
      bloc.series.forEach(serie => {
        const repetitionsSerie = parseInt(serie.repetitions) || 1

        // Distance de la série
        if (serie.typePlage === 'plage') {
          haPlage = true
          const dMin = parseFloat(serie.distanceMin || serie.distance) || 0
          const dMax = parseFloat(serie.distanceMax || serie.distance) || 0
          distanceMin += dMin * repetitionsSerie * repetitionsBloc
          distanceMax += dMax * repetitionsSerie * repetitionsBloc
        } else {
          const distance = parseFloat(serie.distance) || 0
          distanceMin += distance * repetitionsSerie * repetitionsBloc
          distanceMax += distance * repetitionsSerie * repetitionsBloc
        }

        // Distance de la récupération attachée à la série
        if (serie.recuperation) {
          const recup = serie.recuperation
          if (recup.typePlage === 'plage') {
            haPlage = true
            const dMin = parseFloat(recup.distanceMin || recup.distance) || 0
            const dMax = parseFloat(recup.distanceMax || recup.distance) || 0
            distanceMin += dMin * repetitionsSerie * repetitionsBloc
            distanceMax += dMax * repetitionsSerie * repetitionsBloc
          } else {
            const distance = parseFloat(recup.distance) || 0
            distanceMin += distance * repetitionsSerie * repetitionsBloc
            distanceMax += distance * repetitionsSerie * repetitionsBloc
          }
        }
      })
    })

    return haPlage ? { min: distanceMin, max: distanceMax, isRange: true } : distanceMin
  }

  // Calculer la durée totale d'une séance (en secondes)
  const calculerDureeTotaleSeance = (seance) => {
    let dureeMin = 0
    let dureeMax = 0
    let haPlage = false

    seance.blocs.forEach(bloc => {
      const repetitionsBloc = parseInt(bloc.repetitions) || 1
      bloc.series.forEach(serie => {
        const repetitionsSerie = parseInt(serie.repetitions) || 1

        // Durée de la série
        if (serie.typePlage === 'plage') {
          haPlage = true
          const tempsMinSecondes = parserTemps(serie.tempsMin)
          const tempsMaxSecondes = parserTemps(serie.tempsMax)
          if (tempsMinSecondes) {
            dureeMin += tempsMinSecondes * repetitionsSerie * repetitionsBloc
          }
          if (tempsMaxSecondes) {
            dureeMax += tempsMaxSecondes * repetitionsSerie * repetitionsBloc
          }
        } else {
          const tempsSecondes = parserTemps(serie.temps)
          if (tempsSecondes) {
            dureeMin += tempsSecondes * repetitionsSerie * repetitionsBloc
            dureeMax += tempsSecondes * repetitionsSerie * repetitionsBloc
          }
        }

        // Durée de la récupération attachée
        if (serie.recuperation) {
          const recup = serie.recuperation
          if (recup.typePlage === 'plage') {
            haPlage = true
            const tempsMinSecondes = parserTemps(recup.tempsMin)
            const tempsMaxSecondes = parserTemps(recup.tempsMax)
            if (tempsMinSecondes) {
              dureeMin += tempsMinSecondes * repetitionsSerie * repetitionsBloc
            }
            if (tempsMaxSecondes) {
              dureeMax += tempsMaxSecondes * repetitionsSerie * repetitionsBloc
            }
          } else {
            const tempsSecondes = parserTemps(recup.temps)
            if (tempsSecondes) {
              dureeMin += tempsSecondes * repetitionsSerie * repetitionsBloc
              dureeMax += tempsSecondes * repetitionsSerie * repetitionsBloc
            }
          }
        }
      })
    })

    return haPlage ? { min: dureeMin, max: dureeMax, isRange: true } : dureeMin
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

  // Actualiser une série en fonction de l'allure marathon actuelle
  const actualiserSerie = (serie) => {
    if (!allureMarathon) return serie

    const serieActualisee = { ...serie }

    // Mode fixe
    if (serie.typePlage === 'fixe' && serie.pourcentageAllureMarathon) {
      const allure = calculerAllureDepuisAllureMarathon(serie.pourcentageAllureMarathon)
      if (allure) {
        serieActualisee.allure = formaterAllure(allure)
        if (serie.distance) {
          const temps = calculerTemps(serie.distance, allure)
          serieActualisee.temps = temps ? formaterTemps(temps) : ''
        }
        // Mettre à jour le % VMA si VMA est définie
        if (vma) {
          const pourcentageVMA = calculerPourcentageVMA(vma, allure)
          serieActualisee.pourcentageVMA = pourcentageVMA ? Math.round(pourcentageVMA / 5) * 5 : ''
        }
      }
    }

    // Mode plage - Min
    if (serie.typePlage === 'plage' && serie.pourcentageAllureMarathonMin) {
      const allure = calculerAllureDepuisAllureMarathon(serie.pourcentageAllureMarathonMin)
      if (allure) {
        serieActualisee.allureMin = formaterAllure(allure)
        const distance = parseFloat(serie.distanceMin || serie.distance)
        if (distance) {
          const temps = calculerTemps(distance, allure)
          serieActualisee.tempsMin = temps ? formaterTemps(temps) : ''
        }
        // Mettre à jour le % VMA min si VMA est définie
        if (vma) {
          const pourcentageVMA = calculerPourcentageVMA(vma, allure)
          serieActualisee.pourcentageVMAMin = pourcentageVMA ? Math.round(pourcentageVMA / 5) * 5 : ''
        }
      }
    }

    // Mode plage - Max
    if (serie.typePlage === 'plage' && serie.pourcentageAllureMarathonMax) {
      const allure = calculerAllureDepuisAllureMarathon(serie.pourcentageAllureMarathonMax)
      if (allure) {
        serieActualisee.allureMax = formaterAllure(allure)
        const distance = parseFloat(serie.distanceMax || serie.distance)
        if (distance) {
          const temps = calculerTemps(distance, allure)
          serieActualisee.tempsMax = temps ? formaterTemps(temps) : ''
        }
        // Mettre à jour le % VMA max si VMA est définie
        if (vma) {
          const pourcentageVMA = calculerPourcentageVMA(vma, allure)
          serieActualisee.pourcentageVMAMax = pourcentageVMA ? Math.round(pourcentageVMA / 5) * 5 : ''
        }
      }
    }

    return serieActualisee
  }

  // Actualiser une séance complète
  const actualiserSeance = (seance) => {
    if (!allureMarathon) {
      alert('Veuillez définir une allure marathon dans le profil du coureur')
      return seance
    }

    const seanceActualisee = JSON.parse(JSON.stringify(seance)) // Deep copy

    // Parcourir tous les blocs et séries
    seanceActualisee.blocs = seanceActualisee.blocs.map(bloc => ({
      ...bloc,
      series: bloc.series.map(serie => actualiserSerie(serie))
    }))

    return seanceActualisee
  }

  // Actualiser une séance individuelle de l'historique
  const actualiserSeanceHistorique = (id) => {
    if (!allureMarathon) {
      alert('Veuillez définir une allure marathon dans le profil du coureur')
      return
    }

    const nouvelHistorique = historique.map(s =>
      s.id === id ? actualiserSeance(s) : s
    )
    setHistorique(nouvelHistorique)
    localStorage.setItem('plan-marathon-historique', JSON.stringify(nouvelHistorique))
    alert('Séance actualisée !')
  }

  // Actualiser toutes les séances sélectionnées
  const actualiserSelection = () => {
    if (!allureMarathon) {
      alert('Veuillez définir une allure marathon dans le profil du coureur')
      return
    }

    if (seancesSelectionnees.length === 0) {
      alert('Veuillez sélectionner au moins une séance')
      return
    }

    const nouvelHistorique = historique.map(s =>
      seancesSelectionnees.includes(s.id) ? actualiserSeance(s) : s
    )
    setHistorique(nouvelHistorique)
    localStorage.setItem('plan-marathon-historique', JSON.stringify(nouvelHistorique))
    setSeancesSelectionnees([])
    alert(`${seancesSelectionnees.length} séance(s) actualisée(s) !`)
  }

  // Actualiser tout l'historique
  const actualiserTout = () => {
    if (!allureMarathon) {
      alert('Veuillez définir une allure marathon dans le profil du coureur')
      return
    }

    const reponse = confirm(
      `Êtes-vous sûr de vouloir actualiser toutes les séances (${historique.length}) en fonction de l'allure marathon actuelle ?\n\n` +
      `Cette action recalculera toutes les séries qui utilisent le % Allure Marathon.`
    )

    if (!reponse) return

    const nouvelHistorique = historique.map(s => actualiserSeance(s))
    setHistorique(nouvelHistorique)
    localStorage.setItem('plan-marathon-historique', JSON.stringify(nouvelHistorique))
    alert(`${historique.length} séance(s) actualisée(s) !`)
  }

  // Encoder les données de la séance pour l'URL
  const encoderSeancePourURL = (seance) => {
    const donneesSeance = {
      nom: seance.nom,
      dateSeance: seance.dateSeance,
      vma: seance.vma,
      allureMarathon: seance.allureMarathon,
      blocs: seance.blocs,
      commentaire: seance.commentaire
    }
    
    try {
      const donneesJSON = JSON.stringify(donneesSeance)
      const donneesEncodees = btoa(encodeURIComponent(donneesJSON))
      return donneesEncodees
    } catch (error) {
      console.error('Erreur lors de l\'encodage de la séance:', error)
      return null
    }
  }

  // Générer l'URL de la séance (version compacte)
  const genererURLSeance = (seance) => {
    const donneesEncodees = encoderSeancePourURL(seance)
    if (!donneesEncodees) return null
    
    const baseURL = window.location.origin + window.location.pathname
    return `${baseURL}?s=${donneesEncodees}#resume`
  }

  // Générer le contenu .ics pour des séances
  const genererICS = (seances) => {
    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Plan Marathon//Calculateur d'allures//FR
CALSCALE:GREGORIAN
`

    seances.forEach(seance => {
      // Date de la séance ou demain par défaut
      const maintenant = new Date()
      const dateSeance = seance.dateSeance ? new Date(seance.dateSeance + 'T08:00:00') : new Date(maintenant.getTime() + 24*60*60*1000)
      
      const heureDebut = new Date(dateSeance)
      heureDebut.setHours(8, 0, 0, 0)
      
      const heureFin = new Date(heureDebut.getTime() + 2*60*60*1000) // 2 heures plus tard

      // Format de date iCalendar
      const formatDateICS = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      }

      // Construire la description avec les détails
      let description = `Seance: ${seance.nom}\\n\\n`
      
      // Ajouter les blocs de la séance
      seance.blocs.forEach((bloc, indexBloc) => {
        const repetitionsBloc = parseInt(bloc.repetitions) || 1
        let label = ''
        
        switch (bloc.type) {
          case 'echauffement': 
            label = 'Echauffement'
            break
          case 'course': {
            // Compter seulement les blocs de course précédents
            const numeroCourse = seance.blocs.slice(0, indexBloc + 1).filter(b => (b.type || 'course') === 'course').length
            label = `Course ${numeroCourse}`
            break
          }
          case 'recuperation': 
            label = 'Recuperation'
            break
          default: 
            label = 'Course'
        }
        
        description += label
        if (repetitionsBloc > 1) {
          description += ` (x${repetitionsBloc})`
        }
        description += ':\\n'

        bloc.series.forEach(serie => {
          const repetitionsSerie = parseInt(serie.repetitions) || 1
          description += '  - '
          
          if (serie.estRecuperation) {
            description += '[Recup] '
          }
          
          if (repetitionsSerie > 1) {
            description += `${repetitionsSerie}x `
          }

          // Distance - gérer les plages
          if (serie.typePlage === 'plage') {
            const distanceMin = parseFloat(serie.distanceMin) || 0
            const distanceMax = parseFloat(serie.distanceMax) || 0
            if (distanceMin && distanceMax && distanceMin !== distanceMax) {
              description += `${distanceMin}-${distanceMax}m`
            } else {
              description += `${distanceMin || distanceMax || 0}m`
            }
          } else {
            const distance = parseFloat(serie.distance) || 0
            description += `${distance}m`
          }

          // Allure - gérer les plages
          if (serie.typePlage === 'plage' && serie.allureMin && serie.allureMax) {
            if (serie.allureMin === serie.allureMax) {
              description += ` @ ${serie.allureMin}/km`
            } else {
              description += ` @ ${serie.allureMin}-${serie.allureMax}/km`
            }
          } else if (serie.allure) {
            description += ` @ ${serie.allure}/km`
          }

          // Temps - gérer les plages
          if (serie.typePlage === 'plage' && serie.tempsMin && serie.tempsMax) {
            if (serie.tempsMin === serie.tempsMax) {
              description += ` en ${serie.tempsMin}`
            } else {
              description += ` en ${serie.tempsMin}-${serie.tempsMax}`
            }
          } else if (serie.temps) {
            description += ` en ${serie.temps}`
          }

          description += '\\n'

          // Ajouter la récupération entre séries si elle existe
          if (serie.recuperation && !serie.estRecuperation) {
            const recup = serie.recuperation
            description += '    + [Recup] '
            description += `${repetitionsSerie}x `

            // Distance récup
            if (recup.typePlage === 'plage') {
              const distanceMin = parseFloat(recup.distanceMin) || 0
              const distanceMax = parseFloat(recup.distanceMax) || 0
              if (distanceMin && distanceMax && distanceMin !== distanceMax) {
                description += `${distanceMin}-${distanceMax}m`
              } else {
                description += `${distanceMin || distanceMax || 0}m`
              }
            } else {
              const distance = parseFloat(recup.distance) || 0
              description += `${distance}m`
            }

            // Allure récup
            if (recup.typePlage === 'plage' && recup.allureMin && recup.allureMax) {
              if (recup.allureMin === recup.allureMax) {
                description += ` @ ${recup.allureMin}/km`
              } else {
                description += ` @ ${recup.allureMin}-${recup.allureMax}/km`
              }
            } else if (recup.allure) {
              description += ` @ ${recup.allure}/km`
            }

            // Temps récup
            if (recup.typePlage === 'plage' && recup.tempsMin && recup.tempsMax) {
              if (recup.tempsMin === recup.tempsMax) {
                description += ` en ${recup.tempsMin}`
              } else {
                description += ` en ${recup.tempsMin}-${recup.tempsMax}`
              }
            } else if (recup.temps) {
              description += ` en ${recup.temps}`
            }

            description += '\\n'
          }
        })
        description += '\\n'
      })

      // Calculer la distance totale manuellement en gérant les plages
      let distanceTotaleMin = 0
      let distanceTotaleMax = 0
      let hasPlage = false
      
      seance.blocs.forEach(bloc => {
        const repetitionsBloc = parseInt(bloc.repetitions) || 1
        bloc.series.forEach(serie => {
          const repetitionsSerie = parseInt(serie.repetitions) || 1
          let distanceMin = 0
          let distanceMax = 0
          
          if (serie.typePlage === 'plage') {
            distanceMin = parseFloat(serie.distanceMin) || 0
            distanceMax = parseFloat(serie.distanceMax) || 0
            if (distanceMin !== distanceMax && distanceMin > 0 && distanceMax > 0) {
              hasPlage = true
            }
          } else {
            const distance = parseFloat(serie.distance) || 0
            distanceMin = distance
            distanceMax = distance
          }
          
          distanceTotaleMin += distanceMin * repetitionsSerie * repetitionsBloc
          distanceTotaleMax += distanceMax * repetitionsSerie * repetitionsBloc

          // Ajouter la récupération
          if (serie.recuperation && !serie.estRecuperation) {
            const recup = serie.recuperation
            let distanceRecupMin = 0
            let distanceRecupMax = 0
            
            if (recup.typePlage === 'plage') {
              distanceRecupMin = parseFloat(recup.distanceMin) || 0
              distanceRecupMax = parseFloat(recup.distanceMax) || 0
              if (distanceRecupMin !== distanceRecupMax && distanceRecupMin > 0 && distanceRecupMax > 0) {
                hasPlage = true
              }
            } else {
              const distance = parseFloat(recup.distance) || 0
              distanceRecupMin = distance
              distanceRecupMax = distance
            }
            
            distanceTotaleMin += distanceRecupMin * repetitionsSerie * repetitionsBloc
            distanceTotaleMax += distanceRecupMax * repetitionsSerie * repetitionsBloc
          }
        })
      })

      if (distanceTotaleMin > 0 || distanceTotaleMax > 0) {
        if (hasPlage && distanceTotaleMin !== distanceTotaleMax) {
          description += `Distance totale: ${(distanceTotaleMin/1000).toFixed(2)} - ${(distanceTotaleMax/1000).toFixed(2)} km\\n\\n`
        } else {
          description += `Distance totale: ${(distanceTotaleMax/1000).toFixed(2)} km\\n\\n`
        }
      }

      // Ajouter le lien (sans emoji et simplifié)
      const urlSeance = genererURLSeance(seance)
      if (urlSeance) {
        description += `Lien: ${urlSeance}`
      }

      // Nettoyer le titre (supprimer caractères problématiques)
      const titreClean = seance.nom.replace(/[^\w\s\-']/g, '').substring(0, 50)

      icsContent += `BEGIN:VEVENT
UID:${seance.id || Date.now()}-${Math.random().toString(36).substr(2, 9)}@plan-marathon
DTSTAMP:${formatDateICS(new Date())}
DTSTART:${formatDateICS(heureDebut)}
DTEND:${formatDateICS(heureFin)}
SUMMARY:${titreClean}
DESCRIPTION:${description}
CATEGORIES:Sport,Running,Marathon
END:VEVENT
`
    })

    icsContent += 'END:VCALENDAR'
    return icsContent
  }

  // Télécharger le fichier .ics
  const telechargerICS = (seances, nomFichier = 'seances-marathon') => {
    const icsContent = genererICS(seances)
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const date = new Date().toISOString().split('T')[0]
    link.download = `${nomFichier}-${date}.ics`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Exporter tout vers calendrier
  const exporterToutVersCalendrier = () => {
    telechargerICS(historique, 'toutes-seances-marathon')
    alert(`${historique.length} séance(s) exportée(s) vers le calendrier`)
  }

  // Exporter la sélection vers calendrier
  const exporterSelectionVersCalendrier = () => {
    const seancesAExporter = historique.filter(s => seancesSelectionnees.includes(s.id))
    telechargerICS(seancesAExporter, 'selection-seances-marathon')
    alert(`${seancesAExporter.length} séance(s) exportée(s) vers le calendrier`)
    setSeancesSelectionnees([])
  }

  // Exporter une seule séance vers calendrier
  const exporterSeanceVersCalendrier = (seance) => {
    telechargerICS([seance], `seance-${seance.nom.toLowerCase().replace(/\s+/g, '-')}`)
    alert('Séance exportée vers le calendrier')
  }

  // Ajouter un nouveau bloc
  const ajouterBloc = () => {
    setBlocs([...blocs, {
      type: 'course', // 'echauffement', 'course', ou 'recuperation'
      repetitions: 1,
      series: [{
        estRecuperation: false, // false = série normale, true = récupération
        repetitions: 1,
        typePlage: 'fixe', // 'fixe' ou 'plage'
        pourcentageVMA: '',
        pourcentageAllureMarathon: '',
        pourcentageAllureSemiMarathon: '',
        allure: '',
        distance: '',
        temps: '',
        // Pour les plages
        pourcentageVMAMin: '',
        pourcentageVMAMax: '',
        pourcentageAllureMarathonMin: '',
        pourcentageAllureMarathonMax: '',
        pourcentageAllureSemiMarathonMin: '',
        pourcentageAllureSemiMarathonMax: '',
        allureMin: '',
        allureMax: '',
        distanceMin: '',
        distanceMax: '',
        tempsMin: '',
        tempsMax: '',
        // Récupération attachée à la série (optionnelle)
        recuperation: null
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

  // Mettre à jour le type d'un bloc
  const updateTypeBlocFunc = (indexBloc, type) => {
    const nouveauxBlocs = [...blocs]
    const ancienType = nouveauxBlocs[indexBloc].type || 'course'
    nouveauxBlocs[indexBloc].type = type

    // Si on passe de 'course' à 'echauffement' ou 'recuperation'
    if (ancienType === 'course' && (type === 'echauffement' || type === 'recuperation')) {
      // Nettoyer les récupérations et réinitialiser les répétitions
      nouveauxBlocs[indexBloc].repetitions = 1
      nouveauxBlocs[indexBloc].series = nouveauxBlocs[indexBloc].series.map(serie => ({
        ...serie,
        estRecuperation: false, // Enlever le flag de récupération indépendante
        repetitions: 1, // Réinitialiser les répétitions de la série
        recuperation: null // Supprimer la récupération attachée
      }))
    }

    setBlocs(nouveauxBlocs)
  }

  // Obtenir le style selon le type de bloc
  const getBlocStyle = (type) => {
    switch (type) {
      case 'echauffement':
        return {
          borderColor: '#ff9800',
          backgroundColor: '#fff3e0',
          labelColor: '#e65100'
        }
      case 'recuperation':
        return {
          borderColor: '#4caf50',
          backgroundColor: '#e8f5e9',
          labelColor: '#2e7d32'
        }
      case 'course':
      default:
        return {
          borderColor: '#dee2e6',
          backgroundColor: '#fff',
          labelColor: '#495057'
        }
    }
  }

  // Obtenir le libellé du type de bloc
  const getBlocTypeLabel = (type, numeroCourse = null) => {
    switch (type) {
      case 'echauffement':
        return 'Échauffement'
      case 'recuperation':
        return 'Récupération'
      case 'course':
      default:
        return numeroCourse ? `Course ${numeroCourse}` : 'Course'
    }
  }

  // Ajouter une série à un bloc
  const ajouterSerie = (indexBloc) => {
    const nouveauxBlocs = [...blocs]
    nouveauxBlocs[indexBloc].series.push({
      estRecuperation: false,
      repetitions: 1,
      typePlage: 'fixe',
      pourcentageVMA: '',
      pourcentageAllureMarathon: '',
      pourcentageAllureSemiMarathon: '',
      allure: '',
      distance: '',
      temps: '',
      pourcentageVMAMin: '',
      pourcentageVMAMax: '',
      pourcentageAllureMarathonMin: '',
      pourcentageAllureMarathonMax: '',
      pourcentageAllureSemiMarathonMin: '',
      pourcentageAllureSemiMarathonMax: '',
      allureMin: '',
      allureMax: '',
      distanceMin: '',
      distanceMax: '',
      tempsMin: '',
      tempsMax: '',
      recuperation: null
    })
    setBlocs(nouveauxBlocs)
  }

  // Ajouter une récupération à un bloc (série indépendante)
  const ajouterRecuperationSerie = (indexBloc) => {
    const nouveauxBlocs = [...blocs]
    nouveauxBlocs[indexBloc].series.push({
      estRecuperation: true,
      repetitions: 1,
      typePlage: 'fixe',
      pourcentageVMA: '',
      pourcentageAllureMarathon: '',
      pourcentageAllureSemiMarathon: '',
      allure: '',
      distance: '',
      temps: '',
      pourcentageVMAMin: '',
      pourcentageVMAMax: '',
      pourcentageAllureMarathonMin: '',
      pourcentageAllureMarathonMax: '',
      pourcentageAllureSemiMarathonMin: '',
      pourcentageAllureSemiMarathonMax: '',
      allureMin: '',
      allureMax: '',
      distanceMin: '',
      distanceMax: '',
      tempsMin: '',
      tempsMax: '',
      recuperation: null
    })
    setBlocs(nouveauxBlocs)
  }

  // Ajouter une récupération attachée à une série
  const ajouterRecuperation = (indexBloc, indexSerie) => {
    const nouveauxBlocs = [...blocs]
    nouveauxBlocs[indexBloc].series[indexSerie].recuperation = {
      typePlage: 'fixe',
      pourcentageVMA: '',
      pourcentageAllureMarathon: '',
      pourcentageAllureSemiMarathon: '',
      allure: '',
      distance: '',
      temps: '',
      pourcentageVMAMin: '',
      pourcentageVMAMax: '',
      pourcentageAllureMarathonMin: '',
      pourcentageAllureMarathonMax: '',
      pourcentageAllureSemiMarathonMin: '',
      pourcentageAllureSemiMarathonMax: '',
      allureMin: '',
      allureMax: '',
      distanceMin: '',
      distanceMax: '',
      tempsMin: '',
      tempsMax: ''
    }
    setBlocs(nouveauxBlocs)
  }

  // Supprimer une récupération attachée à une série
  const supprimerRecuperation = (indexBloc, indexSerie) => {
    const nouveauxBlocs = [...blocs]
    nouveauxBlocs[indexBloc].series[indexSerie].recuperation = null
    setBlocs(nouveauxBlocs)
  }

  // Mettre à jour une récupération attachée
  const updateRecuperation = (indexBloc, indexSerie, field, value) => {
    const nouveauxBlocs = [...blocs]
    const recuperation = { ...nouveauxBlocs[indexBloc].series[indexSerie].recuperation }

    if (field === 'typePlage') {
      recuperation.typePlage = value
    }

    if (field === 'pourcentageVMA') {
      recuperation.pourcentageVMA = value
      const allure = calculerAllureDepuisVMA(vma, value)
      if (allure) {
        recuperation.allure = formaterAllure(allure)
        if (recuperation.distance) {
          const temps = calculerTemps(recuperation.distance, allure)
          recuperation.temps = temps ? formaterTemps(temps) : ''
        }
        if (allureMarathon) {
          const pourcentageAllureMarathon = calculerPourcentageAllureMarathon(allure)
          recuperation.pourcentageAllureMarathon = pourcentageAllureMarathon ? Math.round(pourcentageAllureMarathon / 5) * 5 : ''
        }
      }
    }

    if (field === 'pourcentageAllureMarathon') {
      recuperation.pourcentageAllureMarathon = value
      const allure = calculerAllureDepuisAllureMarathon(value)
      if (allure) {
        recuperation.allure = formaterAllure(allure)
        if (recuperation.distance) {
          const temps = calculerTemps(recuperation.distance, allure)
          recuperation.temps = temps ? formaterTemps(temps) : ''
        }
        if (vma) {
          const pourcentageVMA = calculerPourcentageVMA(vma, allure)
          recuperation.pourcentageVMA = pourcentageVMA ? Math.round(pourcentageVMA / 5) * 5 : ''
        }
      }
    }

    if (field === 'allure') {
      recuperation.allure = value
      const allureMinutes = parserAllure(value)
      if (vma && allureMinutes) {
        const pourcentage = calculerPourcentageVMA(vma, allureMinutes)
        recuperation.pourcentageVMA = Math.round(pourcentage / 5) * 5
      }
      if (allureMarathon && allureMinutes) {
        const pourcentageAllureMarathon = calculerPourcentageAllureMarathon(allureMinutes)
        recuperation.pourcentageAllureMarathon = Math.round(pourcentageAllureMarathon / 5) * 5
      }
      if (recuperation.distance && allureMinutes) {
        const temps = calculerTemps(recuperation.distance, allureMinutes)
        recuperation.temps = temps ? formaterTemps(temps) : ''
      }
      // Si on a le temps mais pas la distance, calculer la distance
      const distanceActuelle = parseFloat(recuperation.distance)
      if ((!recuperation.distance || !distanceActuelle || distanceActuelle === 0) && recuperation.temps && allureMinutes) {
        const tempsSecondes = parserTemps(recuperation.temps)
        if (tempsSecondes) {
          const tempsMinutes = tempsSecondes / 60
          const distanceKm = tempsMinutes / allureMinutes
          recuperation.distance = Math.round(distanceKm * 1000)
        }
      }
    }

    if (field === 'distance') {
      recuperation.distance = value
      const allureMinutes = parserAllure(recuperation.allure)
      if (allureMinutes) {
        const temps = calculerTemps(value, allureMinutes)
        recuperation.temps = temps ? formaterTemps(temps) : ''
      }
    }

    if (field === 'temps') {
      recuperation.temps = value
      const tempsSecondes = parserTemps(value)
      if (recuperation.distance && tempsSecondes) {
        const allure = calculerAllure(recuperation.distance, tempsSecondes)
        if (allure) {
          recuperation.allure = formaterAllure(allure)
          if (vma) {
            const pourcentage = calculerPourcentageVMA(vma, allure)
            recuperation.pourcentageVMA = Math.round(pourcentage / 5) * 5
          }
          if (allureMarathon) {
            const pourcentageAllureMarathon = calculerPourcentageAllureMarathon(allure)
            recuperation.pourcentageAllureMarathon = Math.round(pourcentageAllureMarathon / 5) * 5
          }
        }
      }
      // Si on a l'allure mais pas la distance, calculer la distance
      const distanceActuelle = parseFloat(recuperation.distance)
      if ((!recuperation.distance || !distanceActuelle || distanceActuelle === 0) && recuperation.allure && tempsSecondes) {
        const allureMinutes = parserAllure(recuperation.allure)
        if (allureMinutes) {
          const tempsMinutes = tempsSecondes / 60
          const distanceKm = tempsMinutes / allureMinutes
          recuperation.distance = Math.round(distanceKm * 1000)
        }
      }
    }

    nouveauxBlocs[indexBloc].series[indexSerie].recuperation = recuperation
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

  // Calculer l'allure depuis le pourcentage d'allure marathon
  const calculerAllureDepuisAllureMarathon = (pourcentage) => {
    if (!allureMarathon || !pourcentage) return null
    const allureMarathonMinutes = parserAllure(allureMarathon)
    if (!allureMarathonMinutes) return null
    // Plus le % est élevé, plus on va vite, donc allure plus rapide (moins de min/km)
    // 100% = allure marathon, 110% = plus rapide, 90% = plus lent
    const allure = allureMarathonMinutes * (100 / pourcentage)
    return allure
  }

  // Calculer le pourcentage d'allure marathon depuis une allure
  const calculerPourcentageAllureMarathon = (allure) => {
    if (!allureMarathon || !allure) return null
    const allureMarathonMinutes = parserAllure(allureMarathon)
    if (!allureMarathonMinutes) return null
    // Plus l'allure est rapide (petite), plus le % est élevé
    const pourcentage = (allureMarathonMinutes / allure) * 100
    return pourcentage
  }

  // Mettre à jour la VMA
  const updateVMA = (value) => {
    setVma(value)
    localStorage.setItem('plan-marathon-vma', value)
  }

  // Remplir automatiquement marathon et semi à la perte de focus de la VMA
  const autoFillFromVMA = (vmaValue) => {
    // Si VMA est définie et que les allures marathon/semi sont vides, les remplir automatiquement
    if (vmaValue) {
      // Marathon : 80% de VMA par défaut
      if (!allureMarathon) {
        const allure = calculerAllureDepuisVMA(vmaValue, 80)
        if (allure) {
          const allureFormatee = formaterAllure(allure)
          setAllureMarathon(allureFormatee)
          localStorage.setItem('plan-marathon-allureMarathon', allureFormatee)

          // Calculer aussi le temps marathon
          const distanceMarathon = 42.195
          const tempsSecondes = calculerTemps(distanceMarathon * 1000, allure)
          if (tempsSecondes) {
            const tempsFormate = formaterTemps(tempsSecondes)
            setTempsMarathon(tempsFormate)
            localStorage.setItem('plan-marathon-tempsMarathon', tempsFormate)
          }
        }
      }

      // Semi-marathon : 85% de VMA par défaut
      if (!allureSemiMarathon) {
        const allure = calculerAllureDepuisVMA(vmaValue, 85)
        if (allure) {
          const allureFormatee = formaterAllure(allure)
          setAllureSemiMarathon(allureFormatee)
          localStorage.setItem('plan-marathon-allureSemiMarathon', allureFormatee)

          // Calculer aussi le temps semi-marathon
          const distanceSemiMarathon = 21.0975
          const tempsSecondes = calculerTemps(distanceSemiMarathon * 1000, allure)
          if (tempsSecondes) {
            const tempsFormate = formaterTemps(tempsSecondes)
            setTempsSemiMarathon(tempsFormate)
            localStorage.setItem('plan-marathon-tempsSemiMarathon', tempsFormate)
          }
        }
      }
    }
  }

  // Mettre à jour l'allure marathon et calculer le temps
  const updateAllureMarathon = (value) => {
    setAllureMarathon(value)
    localStorage.setItem('plan-marathon-allureMarathon', value)

    const allureMinutes = parserAllure(value)
    if (allureMinutes) {
      const distanceMarathon = 42.195
      const tempsSecondes = calculerTemps(distanceMarathon * 1000, allureMinutes)
      if (tempsSecondes) {
        const tempsFormate = formaterTemps(tempsSecondes)
        setTempsMarathon(tempsFormate)
        localStorage.setItem('plan-marathon-tempsMarathon', tempsFormate)
      }
    }
  }

  // Mettre à jour le temps marathon et calculer l'allure
  const updateTempsMarathon = (value) => {
    setTempsMarathon(value)
    localStorage.setItem('plan-marathon-tempsMarathon', value)

    const tempsSecondes = parserTemps(value)
    if (tempsSecondes) {
      const distanceMarathon = 42.195
      const allure = calculerAllure(distanceMarathon * 1000, tempsSecondes)
      if (allure) {
        const allureFormatee = formaterAllure(allure)
        setAllureMarathon(allureFormatee)
        localStorage.setItem('plan-marathon-allureMarathon', allureFormatee)
      }
    }
  }

  // Calculer le % VMA marathon
  const calculerPourcentageVMAMarathon = () => {
    if (!vma || !allureMarathon) return null
    const allureMarathonMinutes = parserAllure(allureMarathon)
    if (!allureMarathonMinutes) return null
    const pourcentage = calculerPourcentageVMA(vma, allureMarathonMinutes)
    return pourcentage ? Math.round(pourcentage) : null
  }

  // Mettre à jour l'allure semi-marathon et calculer le temps
  const updateAllureSemiMarathon = (value) => {
    setAllureSemiMarathon(value)
    localStorage.setItem('plan-marathon-allureSemiMarathon', value)

    const allureMinutes = parserAllure(value)
    if (allureMinutes) {
      const distanceSemiMarathon = 21.0975
      const tempsSecondes = calculerTemps(distanceSemiMarathon * 1000, allureMinutes)
      if (tempsSecondes) {
        const tempsFormate = formaterTemps(tempsSecondes)
        setTempsSemiMarathon(tempsFormate)
        localStorage.setItem('plan-marathon-tempsSemiMarathon', tempsFormate)
      }
    }
  }

  // Mettre à jour le temps semi-marathon et calculer l'allure
  const updateTempsSemiMarathon = (value) => {
    setTempsSemiMarathon(value)
    localStorage.setItem('plan-marathon-tempsSemiMarathon', value)

    const tempsSecondes = parserTemps(value)
    if (tempsSecondes) {
      const distanceSemiMarathon = 21.0975
      const allure = calculerAllure(distanceSemiMarathon * 1000, tempsSecondes)
      if (allure) {
        const allureFormatee = formaterAllure(allure)
        setAllureSemiMarathon(allureFormatee)
        localStorage.setItem('plan-marathon-allureSemiMarathon', allureFormatee)
      }
    }
  }

  // Calculer le % VMA semi-marathon
  const calculerPourcentageVMASemiMarathon = () => {
    if (!vma || !allureSemiMarathon) return null
    const allureSemiMarathonMinutes = parserAllure(allureSemiMarathon)
    if (!allureSemiMarathonMinutes) return null
    const pourcentage = calculerPourcentageVMA(vma, allureSemiMarathonMinutes)
    return pourcentage ? Math.round(pourcentage) : null
  }

  // Calculer l'allure depuis le pourcentage d'allure semi-marathon
  const calculerAllureDepuisAllureSemiMarathon = (pourcentage) => {
    if (!allureSemiMarathon || !pourcentage) return null
    const allureSemiMarathonMinutes = parserAllure(allureSemiMarathon)
    if (!allureSemiMarathonMinutes) return null
    // Plus le % est élevé, plus on va vite, donc allure plus rapide (moins de min/km)
    // 100% = allure semi-marathon, 110% = plus rapide, 90% = plus lent
    const allure = allureSemiMarathonMinutes * (100 / pourcentage)
    return allure
  }

  // Calculer le pourcentage d'allure semi-marathon depuis une allure
  const calculerPourcentageAllureSemiMarathon = (allure) => {
    if (!allureSemiMarathon || !allure) return null
    const allureSemiMarathonMinutes = parserAllure(allureSemiMarathon)
    if (!allureSemiMarathonMinutes) return null
    // Plus l'allure est rapide (petite), plus le % est élevé
    const pourcentage = (allureSemiMarathonMinutes / allure) * 100
    return pourcentage
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

  // Mettre à jour uniquement la valeur d'un champ dans l'UI (sans calculs)
  const updateSerieField = (indexBloc, indexSerie, field, value) => {
    const nouveauxBlocs = [...blocs]
    nouveauxBlocs[indexBloc].series[indexSerie][field] = value
    setBlocs(nouveauxBlocs)
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
        // Mettre à jour le % allure marathon si allure marathon est définie
        if (allureMarathon) {
          const pourcentageAllureMarathon = calculerPourcentageAllureMarathon(allure)
          serie.pourcentageAllureMarathon = pourcentageAllureMarathon ? Math.round(pourcentageAllureMarathon / 5) * 5 : ''
        }
        // Mettre à jour le % allure semi-marathon si allure semi-marathon est définie
        if (allureSemiMarathon) {
          const pourcentageAllureSemiMarathon = calculerPourcentageAllureSemiMarathon(allure)
          serie.pourcentageAllureSemiMarathon = pourcentageAllureSemiMarathon ? Math.round(pourcentageAllureSemiMarathon / 5) * 5 : ''
        }
      }
    }

    // Si pourcentage allure marathon change
    if (field === 'pourcentageAllureMarathon') {
      serie.pourcentageAllureMarathon = value
      const allure = calculerAllureDepuisAllureMarathon(value)
      if (allure) {
        serie.allure = formaterAllure(allure)
        if (serie.distance) {
          const temps = calculerTemps(serie.distance, allure)
          serie.temps = temps ? formaterTemps(temps) : ''
        }
        // Mettre à jour le % VMA si VMA est définie
        if (vma) {
          const pourcentageVMA = calculerPourcentageVMA(vma, allure)
          serie.pourcentageVMA = pourcentageVMA ? Math.round(pourcentageVMA / 5) * 5 : ''
        }
        // Mettre à jour le % allure semi-marathon si allure semi-marathon est définie
        if (allureSemiMarathon) {
          const pourcentageAllureSemiMarathon = calculerPourcentageAllureSemiMarathon(allure)
          serie.pourcentageAllureSemiMarathon = pourcentageAllureSemiMarathon ? Math.round(pourcentageAllureSemiMarathon / 5) * 5 : ''
        }
      }
    }

    // Si pourcentage allure semi-marathon change
    if (field === 'pourcentageAllureSemiMarathon') {
      serie.pourcentageAllureSemiMarathon = value
      const allure = calculerAllureDepuisAllureSemiMarathon(value)
      if (allure) {
        serie.allure = formaterAllure(allure)
        if (serie.distance) {
          const temps = calculerTemps(serie.distance, allure)
          serie.temps = temps ? formaterTemps(temps) : ''
        }
        // Mettre à jour le % VMA si VMA est définie
        if (vma) {
          const pourcentageVMA = calculerPourcentageVMA(vma, allure)
          serie.pourcentageVMA = pourcentageVMA ? Math.round(pourcentageVMA / 5) * 5 : ''
        }
        // Mettre à jour le % allure marathon si allure marathon est définie
        if (allureMarathon) {
          const pourcentageAllureMarathon = calculerPourcentageAllureMarathon(allure)
          serie.pourcentageAllureMarathon = pourcentageAllureMarathon ? Math.round(pourcentageAllureMarathon / 5) * 5 : ''
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
      if (allureMarathon && allureMinutes) {
        const pourcentageAllureMarathon = calculerPourcentageAllureMarathon(allureMinutes)
        const pourcentageArrondi = Math.round(pourcentageAllureMarathon / 5) * 5
        serie.pourcentageAllureMarathon = pourcentageArrondi
      }
      if (allureSemiMarathon && allureMinutes) {
        const pourcentageAllureSemiMarathon = calculerPourcentageAllureSemiMarathon(allureMinutes)
        const pourcentageArrondi = Math.round(pourcentageAllureSemiMarathon / 5) * 5
        serie.pourcentageAllureSemiMarathon = pourcentageArrondi
      }
      if (serie.distance && allureMinutes) {
        const temps = calculerTemps(serie.distance, allureMinutes)
        serie.temps = temps ? formaterTemps(temps) : ''
      }
      // Si on a le temps mais pas la distance, calculer la distance
      const distanceActuelle = parseFloat(serie.distance)
      if ((!serie.distance || !distanceActuelle || distanceActuelle === 0) && serie.temps && allureMinutes) {
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
          if (allureMarathon) {
            const pourcentageAllureMarathon = calculerPourcentageAllureMarathon(allure)
            const pourcentageArrondi = Math.round(pourcentageAllureMarathon / 5) * 5
            serie.pourcentageAllureMarathon = pourcentageArrondi
          }
          if (allureSemiMarathon) {
            const pourcentageAllureSemiMarathon = calculerPourcentageAllureSemiMarathon(allure)
            const pourcentageArrondi = Math.round(pourcentageAllureSemiMarathon / 5) * 5
            serie.pourcentageAllureSemiMarathon = pourcentageArrondi
          }
        }
      }
      // Si on a l'allure mais pas la distance, calculer la distance
      const distanceActuelle = parseFloat(serie.distance)
      if ((!serie.distance || !distanceActuelle || distanceActuelle === 0) && serie.allure && tempsSecondes) {
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
        // Mettre à jour le % allure marathon min si allure marathon est définie
        if (allureMarathon) {
          const pourcentageAllureMarathon = calculerPourcentageAllureMarathon(allure)
          serie.pourcentageAllureMarathonMin = pourcentageAllureMarathon ? Math.round(pourcentageAllureMarathon / 5) * 5 : ''
        }
        // Mettre à jour le % allure semi-marathon min si allure semi-marathon est définie
        if (allureSemiMarathon) {
          const pourcentageAllureSemiMarathon = calculerPourcentageAllureSemiMarathon(allure)
          serie.pourcentageAllureSemiMarathonMin = pourcentageAllureSemiMarathon ? Math.round(pourcentageAllureSemiMarathon / 5) * 5 : ''
        }
      }
    }

    // Si pourcentage allure marathon min change
    if (field === 'pourcentageAllureMarathonMin') {
      serie.pourcentageAllureMarathonMin = value
      const allure = calculerAllureDepuisAllureMarathon(value)
      if (allure) {
        serie.allureMin = formaterAllure(allure)
        const distance = parseFloat(serie.distanceMin || serie.distance)
        if (distance) {
          const temps = calculerTemps(distance, allure)
          serie.tempsMin = temps ? formaterTemps(temps) : ''
        }
        // Mettre à jour le % VMA min si VMA est définie
        if (vma) {
          const pourcentageVMA = calculerPourcentageVMA(vma, allure)
          serie.pourcentageVMAMin = pourcentageVMA ? Math.round(pourcentageVMA / 5) * 5 : ''
        }
        // Mettre à jour le % allure semi-marathon min si allure semi-marathon est définie
        if (allureSemiMarathon) {
          const pourcentageAllureSemiMarathon = calculerPourcentageAllureSemiMarathon(allure)
          serie.pourcentageAllureSemiMarathonMin = pourcentageAllureSemiMarathon ? Math.round(pourcentageAllureSemiMarathon / 5) * 5 : ''
        }
      }
    }

    // Si pourcentage allure semi-marathon min change
    if (field === 'pourcentageAllureSemiMarathonMin') {
      serie.pourcentageAllureSemiMarathonMin = value
      const allure = calculerAllureDepuisAllureSemiMarathon(value)
      if (allure) {
        serie.allureMin = formaterAllure(allure)
        const distance = parseFloat(serie.distanceMin || serie.distance)
        if (distance) {
          const temps = calculerTemps(distance, allure)
          serie.tempsMin = temps ? formaterTemps(temps) : ''
        }
        // Mettre à jour le % VMA min si VMA est définie
        if (vma) {
          const pourcentageVMA = calculerPourcentageVMA(vma, allure)
          serie.pourcentageVMAMin = pourcentageVMA ? Math.round(pourcentageVMA / 5) * 5 : ''
        }
        // Mettre à jour le % allure marathon min si allure marathon est définie
        if (allureMarathon) {
          const pourcentageAllureMarathon = calculerPourcentageAllureMarathon(allure)
          serie.pourcentageAllureMarathonMin = pourcentageAllureMarathon ? Math.round(pourcentageAllureMarathon / 5) * 5 : ''
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
        // Mettre à jour le % allure marathon max si allure marathon est définie
        if (allureMarathon) {
          const pourcentageAllureMarathon = calculerPourcentageAllureMarathon(allure)
          serie.pourcentageAllureMarathonMax = pourcentageAllureMarathon ? Math.round(pourcentageAllureMarathon / 5) * 5 : ''
        }
        // Mettre à jour le % allure semi-marathon max si allure semi-marathon est définie
        if (allureSemiMarathon) {
          const pourcentageAllureSemiMarathon = calculerPourcentageAllureSemiMarathon(allure)
          serie.pourcentageAllureSemiMarathonMax = pourcentageAllureSemiMarathon ? Math.round(pourcentageAllureSemiMarathon / 5) * 5 : ''
        }
      }
    }

    // Si pourcentage allure marathon max change
    if (field === 'pourcentageAllureMarathonMax') {
      serie.pourcentageAllureMarathonMax = value
      const allure = calculerAllureDepuisAllureMarathon(value)
      if (allure) {
        serie.allureMax = formaterAllure(allure)
        const distance = parseFloat(serie.distanceMax || serie.distance)
        if (distance) {
          const temps = calculerTemps(distance, allure)
          serie.tempsMax = temps ? formaterTemps(temps) : ''
        }
        // Mettre à jour le % VMA max si VMA est définie
        if (vma) {
          const pourcentageVMA = calculerPourcentageVMA(vma, allure)
          serie.pourcentageVMAMax = pourcentageVMA ? Math.round(pourcentageVMA / 5) * 5 : ''
        }
        // Mettre à jour le % allure semi-marathon max si allure semi-marathon est définie
        if (allureSemiMarathon) {
          const pourcentageAllureSemiMarathon = calculerPourcentageAllureSemiMarathon(allure)
          serie.pourcentageAllureSemiMarathonMax = pourcentageAllureSemiMarathon ? Math.round(pourcentageAllureSemiMarathon / 5) * 5 : ''
        }
      }
    }

    // Si pourcentage allure semi-marathon max change
    if (field === 'pourcentageAllureSemiMarathonMax') {
      serie.pourcentageAllureSemiMarathonMax = value
      const allure = calculerAllureDepuisAllureSemiMarathon(value)
      if (allure) {
        serie.allureMax = formaterAllure(allure)
        const distance = parseFloat(serie.distanceMax || serie.distance)
        if (distance) {
          const temps = calculerTemps(distance, allure)
          serie.tempsMax = temps ? formaterTemps(temps) : ''
        }
        // Mettre à jour le % VMA max si VMA est définie
        if (vma) {
          const pourcentageVMA = calculerPourcentageVMA(vma, allure)
          serie.pourcentageVMAMax = pourcentageVMA ? Math.round(pourcentageVMA / 5) * 5 : ''
        }
        // Mettre à jour le % allure marathon max si allure marathon est définie
        if (allureMarathon) {
          const pourcentageAllureMarathon = calculerPourcentageAllureMarathon(allure)
          serie.pourcentageAllureMarathonMax = pourcentageAllureMarathon ? Math.round(pourcentageAllureMarathon / 5) * 5 : ''
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
      if (allureMarathon && allureMinutes) {
        const pourcentageAllureMarathon = calculerPourcentageAllureMarathon(allureMinutes)
        const pourcentageArrondi = Math.round(pourcentageAllureMarathon / 5) * 5
        serie.pourcentageAllureMarathonMin = pourcentageArrondi
      }
      if (allureSemiMarathon && allureMinutes) {
        const pourcentageAllureSemiMarathon = calculerPourcentageAllureSemiMarathon(allureMinutes)
        const pourcentageArrondi = Math.round(pourcentageAllureSemiMarathon / 5) * 5
        serie.pourcentageAllureSemiMarathonMin = pourcentageArrondi
      }
      const distance = parseFloat(serie.distanceMin || serie.distance)
      if (distance && allureMinutes) {
        const temps = calculerTemps(distance, allureMinutes)
        serie.tempsMin = temps ? formaterTemps(temps) : ''
      }
      // Si on a le temps mais pas la distance, calculer la distance
      const distanceMinActuelle = parseFloat(serie.distanceMin)
      const distanceActuelle = parseFloat(serie.distance)
      if ((!serie.distanceMin || !distanceMinActuelle || distanceMinActuelle === 0) &&
          (!serie.distance || !distanceActuelle || distanceActuelle === 0) &&
          serie.tempsMin && allureMinutes) {
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
      if (allureMarathon && allureMinutes) {
        const pourcentageAllureMarathon = calculerPourcentageAllureMarathon(allureMinutes)
        const pourcentageArrondi = Math.round(pourcentageAllureMarathon / 5) * 5
        serie.pourcentageAllureMarathonMax = pourcentageArrondi
      }
      if (allureSemiMarathon && allureMinutes) {
        const pourcentageAllureSemiMarathon = calculerPourcentageAllureSemiMarathon(allureMinutes)
        const pourcentageArrondi = Math.round(pourcentageAllureSemiMarathon / 5) * 5
        serie.pourcentageAllureSemiMarathonMax = pourcentageArrondi
      }
      const distance = parseFloat(serie.distanceMax || serie.distance)
      if (distance && allureMinutes) {
        const temps = calculerTemps(distance, allureMinutes)
        serie.tempsMax = temps ? formaterTemps(temps) : ''
      }
      // Si on a le temps mais pas la distance, calculer la distance
      const distanceMaxActuelle = parseFloat(serie.distanceMax)
      const distanceActuelle = parseFloat(serie.distance)
      if ((!serie.distanceMax || !distanceMaxActuelle || distanceMaxActuelle === 0) &&
          (!serie.distance || !distanceActuelle || distanceActuelle === 0) &&
          serie.tempsMax && allureMinutes) {
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
          if (allureMarathon) {
            const pourcentageAllureMarathon = calculerPourcentageAllureMarathon(allure)
            const pourcentageArrondi = Math.round(pourcentageAllureMarathon / 5) * 5
            serie.pourcentageAllureMarathonMin = pourcentageArrondi
          }
        }
      }
      // Si on a l'allure mais pas la distance, calculer la distance
      const distanceMinActuelle = parseFloat(serie.distanceMin)
      const distanceActuelle = parseFloat(serie.distance)
      if ((!serie.distanceMin || !distanceMinActuelle || distanceMinActuelle === 0) &&
          (!serie.distance || !distanceActuelle || distanceActuelle === 0) &&
          serie.allureMin && tempsSecondes) {
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
          if (allureMarathon) {
            const pourcentageAllureMarathon = calculerPourcentageAllureMarathon(allure)
            const pourcentageArrondi = Math.round(pourcentageAllureMarathon / 5) * 5
            serie.pourcentageAllureMarathonMax = pourcentageArrondi
          }
        }
      }
      // Si on a l'allure mais pas la distance, calculer la distance
      const distanceMaxActuelle = parseFloat(serie.distanceMax)
      const distanceActuelle = parseFloat(serie.distance)
      if ((!serie.distanceMax || !distanceMaxActuelle || distanceMaxActuelle === 0) &&
          (!serie.distance || !distanceActuelle || distanceActuelle === 0) &&
          serie.allureMax && tempsSecondes) {
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
            if (allureMarathon) {
              const pourcentageAllureMarathon = calculerPourcentageAllureMarathon(allure)
              serie.pourcentageAllureMarathonMin = Math.round(pourcentageAllureMarathon / 5) * 5
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
            if (allureMarathon) {
              const pourcentageAllureMarathon = calculerPourcentageAllureMarathon(allure)
              serie.pourcentageAllureMarathonMax = Math.round(pourcentageAllureMarathon / 5) * 5
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
    let distanceMin = 0
    let distanceMax = 0
    let haPlage = false

    blocs.forEach(bloc => {
      const repetitionsBloc = parseInt(bloc.repetitions) || 1
      bloc.series.forEach(serie => {
        const repetitionsSerie = parseInt(serie.repetitions) || 1

        // Distance de la série
        if (serie.typePlage === 'plage') {
          haPlage = true
          const dMin = parseFloat(serie.distanceMin || serie.distance) || 0
          const dMax = parseFloat(serie.distanceMax || serie.distance) || 0
          distanceMin += dMin * repetitionsSerie * repetitionsBloc
          distanceMax += dMax * repetitionsSerie * repetitionsBloc
        } else {
          const distance = parseFloat(serie.distance) || 0
          distanceMin += distance * repetitionsSerie * repetitionsBloc
          distanceMax += distance * repetitionsSerie * repetitionsBloc
        }

        // Distance de la récupération attachée à la série
        if (serie.recuperation) {
          const recup = serie.recuperation
          if (recup.typePlage === 'plage') {
            haPlage = true
            const dMin = parseFloat(recup.distanceMin || recup.distance) || 0
            const dMax = parseFloat(recup.distanceMax || recup.distance) || 0
            distanceMin += dMin * repetitionsSerie * repetitionsBloc
            distanceMax += dMax * repetitionsSerie * repetitionsBloc
          } else {
            const distance = parseFloat(recup.distance) || 0
            distanceMin += distance * repetitionsSerie * repetitionsBloc
            distanceMax += distance * repetitionsSerie * repetitionsBloc
          }
        }
      })
    })

    return haPlage ? { min: distanceMin, max: distanceMax, isRange: true } : distanceMin
  }

  // Copier le lien de la séance actuelle
  const copierLienSeance = () => {
    const seanceActuelle = {
      nom: nomSeance,
      dateSeance,
      vma,
      allureMarathon,
      blocs,
      commentaire: commentaireSeance
    }
    
    const urlSeance = genererURLSeance(seanceActuelle)
    if (urlSeance) {
      navigator.clipboard.writeText(urlSeance).then(() => {
        alert('Lien de la séance copié dans le presse-papiers!')
      }).catch(() => {
        // Fallback pour les navigateurs qui ne supportent pas l'API clipboard
        const textArea = document.createElement('textarea')
        textArea.value = urlSeance
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        alert('Lien de la séance copié dans le presse-papiers!')
      })
    } else {
      alert('Erreur lors de la génération du lien de la séance')
    }
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
      sauvegarderHistorique({ nom: nomSeance, vma, blocs, dateSeance, commentaire: commentaireSeance })
      alert('Séance sauvegardée !')
      // Réinitialiser le formulaire après sauvegarde
      setNomSeance('')
      setVma('')
      setBlocs([])
      setDateSeance('')
      setCommentaireSeance('')
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
      <div className="app">
        <h1>Plan Marathon - Calculateur d'allures</h1>

        {/* Bloc Profil du coureur */}
        <div className="bloc-container" style={{ marginBottom: '2rem' }}>
          <div className="bloc-header">
            <h2 style={{ margin: 0, color: '#495057' }}>Profil du coureur</h2>
          </div>

          {/* Ligne 1: VMA */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2 }}>
            <TextField
              label="VMA"
              type="number"
              value={vma}
              onChange={(e) => updateVMA(e.target.value)}
              onBlur={(e) => autoFillFromVMA(e.target.value)}
              onFocus={handleFocus}
              placeholder="Ex: 16"
              size="small"
              sx={{ width: '150px' }}
              inputProps={{ step: 0.1 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">km/h</InputAdornment>
              }}
            />
          </Box>

          {/* Ligne 2: Marathon */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start', mb: 2 }}>
            <TextField
              label="Allure marathon"
              value={allureMarathon}
              onChange={(e) => {
                const formatted = formatAllureInput(e.target.value)
                updateAllureMarathon(formatted)
              }}
              onFocus={handleFocus}
              placeholder="530"
              size="small"
              sx={{ width: '180px' }}
              InputProps={{
                endAdornment: <InputAdornment position="end">min/km</InputAdornment>
              }}
            />
            <TextField
              label="Temps marathon"
              value={tempsMarathon}
              onChange={(e) => {
                const formatted = formatTempsInput(e.target.value)
                updateTempsMarathon(formatted)
              }}
              onFocus={handleFocus}
              placeholder="34500"
              size="small"
              sx={{ width: '180px' }}

            />
            {calculerPourcentageVMAMarathon() && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#e3f2fd', px: 2, py: 0.9, borderRadius: 1 }}>
                <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 500 }}>% VMA Marathon:</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1976d2' }}>
                  {calculerPourcentageVMAMarathon()}%
                </span>
              </Box>
            )}
          </Box>

          {/* Ligne 3: Semi-Marathon */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <TextField
              label="Allure semi-marathon"
              value={allureSemiMarathon}
              onChange={(e) => {
                const formatted = formatAllureInput(e.target.value)
                updateAllureSemiMarathon(formatted)
              }}
              onFocus={handleFocus}
              placeholder="500"
              size="small"
              sx={{ width: '180px' }}
              InputProps={{
                endAdornment: <InputAdornment position="end">min/km</InputAdornment>
              }}
            />
            <TextField
              label="Temps semi-marathon"
              value={tempsSemiMarathon}
              onChange={(e) => {
                const formatted = formatTempsInput(e.target.value)
                updateTempsSemiMarathon(formatted)
              }}
              onFocus={handleFocus}
              placeholder="13000"
              size="small"
              sx={{ width: '180px' }}

            />
            {calculerPourcentageVMASemiMarathon() && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#e8f5e9', px: 2, py: 0.9, borderRadius: 1 }}>
                <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 500 }}>% VMA Semi:</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2e7d32' }}>
                  {calculerPourcentageVMASemiMarathon()}%
                </span>
              </Box>
            )}
          </Box>
        </div>

        <div className="top-section" style={{ flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap', width: '100%' }}>
            <TextField
              label="Nom de la séance"
              value={nomSeance}
              onChange={(e) => setNomSeance(e.target.value)}
              placeholder="Ex: Séance VMA"
              size="small"
              sx={{ flex: '1 1 auto', minWidth: '200px' }}
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
            <button className="btn-primary" onClick={ajouterBloc} style={{ width: '170px' }}>+ Ajouter un bloc</button>
            {seanceEnCoursEdition && (
              <button className="btn-secondary" onClick={annulerEdition}>Annuler</button>
            )}
            <button
              className="btn-success"
              onClick={sauvegarderSeance}
              disabled={blocs.length === 0 || nomSeance.includes('(Aperçu)')}
            >
              {seanceEnCoursEdition ? 'Mettre à jour' : 'Sauvegarder'}
            </button>
            <button
              className="btn-secondary"
              onClick={copierLienSeance}
              disabled={blocs.length === 0}
              title="Copier le lien de partage de cette séance"
            >
              🔗 Copier lien
            </button>
          </div>
          <TextField
            label="Commentaire"
            value={commentaireSeance}
            onChange={(e) => setCommentaireSeance(e.target.value)}
            size="small"
            fullWidth
            multiline
            rows={2}
          />
        </div>

      {blocs.map((bloc, indexBloc) => {
        const blocStyle = getBlocStyle(bloc.type || 'course')
        // Calculer le numéro de course en comptant uniquement les blocs de type 'course' avant celui-ci
        const numeroCourse = blocs.slice(0, indexBloc + 1).filter(b => (b.type || 'course') === 'course').length
        return (
        <div
          key={indexBloc}
          className="bloc-container"
          style={{
            borderColor: blocStyle.borderColor,
            backgroundColor: blocStyle.backgroundColor
          }}
        >
          <div className="bloc-header">
            <div className="bloc-title">
              <h2 style={{ color: blocStyle.labelColor }}>
                {getBlocTypeLabel(bloc.type || 'course', (bloc.type || 'course') === 'course' ? numeroCourse : null)}
              </h2>
              {(bloc.type || 'course') === 'course' && (
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
              )}
            </div>
            <div className="bloc-actions">
              {(bloc.type || 'course') === 'course' && (
                <>
                  <button className="btn-secondary" onClick={() => ajouterSerie(indexBloc)}>+ Série</button>
                  <button className="btn-secondary" onClick={() => ajouterRecuperationSerie(indexBloc)}>+ Récupération</button>
                </>
              )}
              <button className="btn-secondary" onClick={() => dupliquerBloc(indexBloc)}>Dupliquer</button>
              <button className="btn-danger" onClick={() => supprimerBloc(indexBloc)}>Supprimer</button>
            </div>
          </div>

          {/* Sélecteur de type de bloc */}
          <div className="serie-type-selector" style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.6)' }}>
            <label>
              <input
                type="radio"
                name={`bloc-type-${indexBloc}`}
                value="echauffement"
                checked={(bloc.type || 'course') === 'echauffement'}
                onChange={(e) => updateTypeBlocFunc(indexBloc, e.target.value)}
              />
              <LocalFireDepartmentIcon fontSize="small" /> Échauffement
            </label>
            <label>
              <input
                type="radio"
                name={`bloc-type-${indexBloc}`}
                value="course"
                checked={(bloc.type || 'course') === 'course'}
                onChange={(e) => updateTypeBlocFunc(indexBloc, e.target.value)}
              />
              <DirectionsRunIcon fontSize="small" /> Course
            </label>
            <label>
              <input
                type="radio"
                name={`bloc-type-${indexBloc}`}
                value="recuperation"
                checked={(bloc.type || 'course') === 'recuperation'}
                onChange={(e) => updateTypeBlocFunc(indexBloc, e.target.value)}
              />
              <HotelIcon fontSize="small" /> Récupération
            </label>
          </div>

          {bloc.series.map((serie, indexSerie) => (
            <div
              key={indexSerie}
              className="serie-row"
              style={serie.estRecuperation ? {
                background: '#fff8e1',
                border: '2px solid #ffd54f'
              } : {}}
            >
              <div className="serie-header">
                <div className="serie-title">
                  {(bloc.type || 'course') === 'course' && (
                    <span>
                      {serie.estRecuperation ? (
                        <><HotelIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Récupération</>
                      ) : (
                        `Série ${indexSerie + 1}`
                      )}
                    </span>
                  )}
                  {(bloc.type || 'course') === 'course' && (
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
                  )}
                </div>
                <div className="serie-actions">
                  {(bloc.type || 'course') === 'course' && (
                    <button className="btn-small-secondary" onClick={() => dupliquerSerie(indexBloc, indexSerie)}>⎘</button>
                  )}
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
                      updateSerieField(indexBloc, indexSerie, 'temps', formatted)
                    }}
                    onBlur={(e) => {
                      const formatted = formatTempsInput(e.target.value)
                      updateSerie(indexBloc, indexSerie, 'temps', formatted)
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
                    label="Allure Marathon"
                    type="number"
                    value={serie.pourcentageAllureMarathon}
                    onChange={(e) => updateSerie(indexBloc, indexSerie, 'pourcentageAllureMarathon', e.target.value)}
                    onFocus={handleFocus}
                    placeholder="100"
                    size="small"
                    disabled={!allureMarathon}
                    inputProps={{ step: 5 }}
                    sx={{ width: '140px' }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                  />
                  <TextField
                    label="Allure Semi"
                    type="number"
                    value={serie.pourcentageAllureSemiMarathon}
                    onChange={(e) => updateSerie(indexBloc, indexSerie, 'pourcentageAllureSemiMarathon', e.target.value)}
                    onFocus={handleFocus}
                    placeholder="105"
                    size="small"
                    disabled={!allureSemiMarathon}
                    inputProps={{ step: 5 }}
                    sx={{ width: '140px' }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                  />
                  <TextField
                    label="Allure"
                    value={serie.allure}
                    onChange={(e) => {
                      const formatted = formatAllureInput(e.target.value)
                      updateSerieField(indexBloc, indexSerie, 'allure', formatted)
                    }}
                    onBlur={(e) => {
                      const formatted = formatAllureInput(e.target.value)
                      updateSerie(indexBloc, indexSerie, 'allure', formatted)
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
                      updateSerieField(indexBloc, indexSerie, 'temps', formatted)
                    }}
                    onBlur={(e) => {
                      const formatted = formatTempsInput(e.target.value)
                      updateSerie(indexBloc, indexSerie, 'temps', formatted)
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
                      label="Allure Marathon"
                      type="number"
                      value={serie.pourcentageAllureMarathonMin}
                      onChange={(e) => updateSerie(indexBloc, indexSerie, 'pourcentageAllureMarathonMin', e.target.value)}
                      onFocus={handleFocus}
                      placeholder="95"
                      size="small"
                      fullWidth
                      disabled={!allureMarathon}
                      inputProps={{ step: 5 }}
                      sx={{ mb: 2 }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>
                      }}
                    />
                    <TextField
                      label="Allure Semi"
                      type="number"
                      value={serie.pourcentageAllureSemiMarathonMin}
                      onChange={(e) => updateSerie(indexBloc, indexSerie, 'pourcentageAllureSemiMarathonMin', e.target.value)}
                      onFocus={handleFocus}
                      placeholder="100"
                      size="small"
                      fullWidth
                      disabled={!allureSemiMarathon}
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
                        updateSerieField(indexBloc, indexSerie, 'allureMin', formatted)
                      }}
                      onBlur={(e) => {
                        const formatted = formatAllureInput(e.target.value)
                        updateSerie(indexBloc, indexSerie, 'allureMin', formatted)
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
                        updateSerieField(indexBloc, indexSerie, 'tempsMin', formatted)
                      }}
                      onBlur={(e) => {
                        const formatted = formatTempsInput(e.target.value)
                        updateSerie(indexBloc, indexSerie, 'tempsMin', formatted)
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
                      label="Allure Marathon"
                      type="number"
                      value={serie.pourcentageAllureMarathonMax}
                      onChange={(e) => updateSerie(indexBloc, indexSerie, 'pourcentageAllureMarathonMax', e.target.value)}
                      onFocus={handleFocus}
                      placeholder="105"
                      size="small"
                      fullWidth
                      disabled={!allureMarathon}
                      inputProps={{ step: 5 }}
                      sx={{ mb: 2 }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>
                      }}
                    />
                    <TextField
                      label="Allure Semi"
                      type="number"
                      value={serie.pourcentageAllureSemiMarathonMax}
                      onChange={(e) => updateSerie(indexBloc, indexSerie, 'pourcentageAllureSemiMarathonMax', e.target.value)}
                      onFocus={handleFocus}
                      placeholder="110"
                      size="small"
                      fullWidth
                      disabled={!allureSemiMarathon}
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
                        updateSerieField(indexBloc, indexSerie, 'allureMax', formatted)
                      }}
                      onBlur={(e) => {
                        const formatted = formatAllureInput(e.target.value)
                        updateSerie(indexBloc, indexSerie, 'allureMax', formatted)
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
                        updateSerieField(indexBloc, indexSerie, 'tempsMax', formatted)
                      }}
                      onBlur={(e) => {
                        const formatted = formatTempsInput(e.target.value)
                        updateSerie(indexBloc, indexSerie, 'tempsMax', formatted)
                      }}
                      onFocus={handleFocus}
                      placeholder="12345"
                      size="small"
                      fullWidth
                    />
                  </Box>
                </Box>
              )}

              {/* Bouton et section Récupération attachée à la série */}
              {!serie.estRecuperation && (bloc.type || 'course') === 'course' && (
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f8f9fa', borderRadius: '6px' }}>
                  {!serie.recuperation ? (
                    <button
                      className="btn-secondary"
                      onClick={() => ajouterRecuperation(indexBloc, indexSerie)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      + Ajouter récupération
                    </button>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '2px solid #dee2e6' }}>
                        <span style={{ fontWeight: 600, color: '#495057' }}>Récupération</span>
                        <button className="btn-small-danger" onClick={() => supprimerRecuperation(indexBloc, indexSerie)}>× Supprimer</button>
                      </div>

                      <div className="serie-type-selector" style={{ marginBottom: '0.75rem' }}>
                        <label>
                          <input
                            type="radio"
                            name={`recup-type-${indexBloc}-${indexSerie}`}
                            value="fixe"
                            checked={serie.recuperation.typePlage === 'fixe'}
                            onChange={(e) => updateRecuperation(indexBloc, indexSerie, 'typePlage', e.target.value)}
                          />
                          Allure fixe
                        </label>
                        <label>
                          <input
                            type="radio"
                            name={`recup-type-${indexBloc}-${indexSerie}`}
                            value="plage"
                            checked={serie.recuperation.typePlage === 'plage'}
                            onChange={(e) => updateRecuperation(indexBloc, indexSerie, 'typePlage', e.target.value)}
                          />
                          Plage d'allures
                        </label>
                      </div>

                      {serie.recuperation.typePlage === 'fixe' ? (
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          <TextField
                            label="Distance"
                            type="number"
                            value={serie.recuperation.distance}
                            onChange={(e) => updateRecuperation(indexBloc, indexSerie, 'distance', e.target.value)}
                            onFocus={handleFocus}
                            placeholder="200"
                            size="small"
                            sx={{ width: '120px' }}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">m</InputAdornment>
                            }}
                          />
                          <TextField
                            label="VMA"
                            type="number"
                            value={serie.recuperation.pourcentageVMA}
                            onChange={(e) => updateRecuperation(indexBloc, indexSerie, 'pourcentageVMA', e.target.value)}
                            onFocus={handleFocus}
                            placeholder="60"
                            size="small"
                            disabled={!vma}
                            inputProps={{ step: 5 }}
                            sx={{ width: '100px' }}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">%</InputAdornment>
                            }}
                          />
                          <TextField
                            label="Allure Marathon"
                            type="number"
                            value={serie.recuperation.pourcentageAllureMarathon}
                            onChange={(e) => updateRecuperation(indexBloc, indexSerie, 'pourcentageAllureMarathon', e.target.value)}
                            onFocus={handleFocus}
                            placeholder="80"
                            size="small"
                            disabled={!allureMarathon}
                            inputProps={{ step: 5 }}
                            sx={{ width: '140px' }}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">%</InputAdornment>
                            }}
                          />
                          <TextField
                            label="Allure"
                            value={serie.recuperation.allure}
                            onChange={(e) => {
                              const formatted = formatAllureInput(e.target.value)
                              updateRecuperation(indexBloc, indexSerie, 'allure', formatted)
                            }}
                            onFocus={handleFocus}
                            placeholder="600"
                            size="small"
                            sx={{ width: '140px' }}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">min/km</InputAdornment>
                            }}
                          />
                          <TextField
                            label="Temps"
                            value={serie.recuperation.temps}
                            onChange={(e) => {
                              const formatted = formatTempsInput(e.target.value)
                              updateRecuperation(indexBloc, indexSerie, 'temps', formatted)
                            }}
                            onFocus={handleFocus}
                            placeholder="100"
                            size="small"
                            sx={{ width: '150px' }}
                          />
                        </Box>
                      ) : (
                        <div style={{ fontSize: '0.85rem', color: '#6c757d', fontStyle: 'italic' }}>
                          Le mode plage pour les récupérations sera bientôt disponible
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>
          ))}
        </div>
        )
      })}

      {blocs.length > 0 && (
        <div ref={resumeRef} id="resume" className="summary">
          <h2>Résumé de la séance</h2>
          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-label">Distance totale</div>
              <div className="summary-value">
                {(() => {
                  const distanceResult = calculerDistanceTotale()
                  if (distanceResult.isRange) {
                    return `${(distanceResult.min / 1000).toFixed(2)} - ${(distanceResult.max / 1000).toFixed(2)} km`
                  }
                  return `${(distanceResult / 1000).toFixed(2)} km`
                })()}
              </div>
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
              const blocType = bloc.type || 'course'
              return (
                <div key={indexBloc} className="summary-bloc">
                  <div className="summary-bloc-title">
                    {(() => {
                      // Calculer le numéro de course
                      const numeroCourse = blocs.slice(0, indexBloc + 1).filter(b => (b.type || 'course') === 'course').length
                      const label = getBlocTypeLabel(blocType, blocType === 'course' ? numeroCourse : null)
                      return blocType === 'course' && repetitionsBloc > 1 ? `${label} (×${repetitionsBloc})` : label
                    })()}
                  </div>
                  <div className="summary-series-list">
                    {bloc.series.map((serie, indexSerie) => {
                      const repetitionsSerie = parseInt(serie.repetitions) || 1
                      const distance = parseFloat(serie.distance) || 0
                      const distanceTotale = distance * repetitionsSerie * repetitionsBloc

                      const serieElements = []

                      // Affichage de la série
                      if (serie.typePlage === 'plage') {
                        const distanceMin = parseFloat(serie.distanceMin || serie.distance) || 0
                        const distanceMax = parseFloat(serie.distanceMax || serie.distance) || 0
                        const distanceTotaleMin = distanceMin * repetitionsSerie * repetitionsBloc
                        const distanceTotaleMax = distanceMax * repetitionsSerie * repetitionsBloc

                        serieElements.push(
                          <div
                            key={`serie-${indexSerie}`}
                            className="summary-serie-item summary-serie-plage"
                            style={serie.estRecuperation ? { background: '#fff8e1', border: '1px solid #ffd54f' } : {}}
                          >
                            {serie.estRecuperation && <HotelIcon fontSize="small" style={{ marginRight: '4px' }} />}
                            {blocType === 'course' && <span className="summary-serie-count">{repetitionsSerie}×</span>}
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
                      } else {
                        serieElements.push(
                          <div
                            key={`serie-${indexSerie}`}
                            className="summary-serie-item"
                            style={serie.estRecuperation ? { background: '#fff8e1', border: '1px solid #ffd54f' } : {}}
                          >
                            {serie.estRecuperation && <HotelIcon fontSize="small" style={{ marginRight: '4px' }} />}
                            {blocType === 'course' && <span className="summary-serie-count">{repetitionsSerie}×</span>}
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
                      }

                      // Affichage de la récupération attachée à la série (seulement pour les blocs de type 'course')
                      if (serie.recuperation && !serie.estRecuperation && blocType === 'course') {
                        const recup = serie.recuperation
                        const distanceRecup = parseFloat(recup.distance) || 0
                        const distanceTotaleRecup = distanceRecup * repetitionsSerie * repetitionsBloc

                        if (recup.typePlage === 'plage') {
                          const distanceMinRecup = parseFloat(recup.distanceMin || recup.distance) || 0
                          const distanceMaxRecup = parseFloat(recup.distanceMax || recup.distance) || 0
                          const distanceTotaleMinRecup = distanceMinRecup * repetitionsSerie * repetitionsBloc
                          const distanceTotaleMaxRecup = distanceMaxRecup * repetitionsSerie * repetitionsBloc

                          serieElements.push(
                            <div
                              key={`recup-${indexSerie}`}
                              className="summary-serie-item summary-serie-plage"
                              style={{ background: '#f0f0f0', border: '1px solid #ccc', paddingLeft: '2rem' }}
                            >
                              <HotelIcon fontSize="small" style={{ marginRight: '4px' }} />
                              {blocType === 'course' && <span className="summary-serie-count">{repetitionsSerie}×</span>}
                              {recup.distanceMin && recup.distanceMax ? (
                                <span className="summary-serie-distance">{distanceMinRecup}m - {distanceMaxRecup}m</span>
                              ) : (
                                <span className="summary-serie-distance">{distanceRecup}m</span>
                              )}
                              {recup.allureMin && recup.allureMax && (
                                <span className="summary-serie-allure">
                                  @ {recup.allureMin} - {recup.allureMax}/km
                                </span>
                              )}
                              {recup.pourcentageVMAMin && recup.pourcentageVMAMax && (
                                <span className="summary-serie-vma">({recup.pourcentageVMAMin}% - {recup.pourcentageVMAMax}% VMA)</span>
                              )}
                              {recup.tempsMin && recup.tempsMax && (
                                <span className="summary-serie-temps">en {formaterTempsLisible(recup.tempsMin)} - {formaterTempsLisible(recup.tempsMax)}</span>
                              )}
                              {recup.distanceMin && recup.distanceMax ? (
                                <span className="summary-serie-total">= {(distanceTotaleMinRecup / 1000).toFixed(2)} - {(distanceTotaleMaxRecup / 1000).toFixed(2)}km</span>
                              ) : (
                                <span className="summary-serie-total">= {(distanceTotaleRecup / 1000).toFixed(2)}km</span>
                              )}
                            </div>
                          )
                        } else {
                          serieElements.push(
                            <div
                              key={`recup-${indexSerie}`}
                              className="summary-serie-item"
                              style={{ background: '#f0f0f0', border: '1px solid #ccc', paddingLeft: '2rem' }}
                            >
                              <HotelIcon fontSize="small" style={{ marginRight: '4px' }} />
                              {blocType === 'course' && <span className="summary-serie-count">{repetitionsSerie}×</span>}
                              <span className="summary-serie-distance">{distanceRecup}m</span>
                              {recup.allure && (
                                <span className="summary-serie-allure">
                                  @ {recup.allure}/km
                                </span>
                              )}
                              {recup.pourcentageVMA && (
                                <span className="summary-serie-vma">({recup.pourcentageVMA}% VMA)</span>
                              )}
                              {recup.temps && (
                                <span className="summary-serie-temps">en {formaterTempsLisible(recup.temps)}</span>
                              )}
                              <span className="summary-serie-total">= {(distanceTotaleRecup / 1000).toFixed(2)}km</span>
                            </div>
                          )
                        }
                      }

                      return serieElements
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
              <Tooltip title="Exporter toutes les séances vers Google Calendar (fichier .ics)">
                <button className="btn-primary" onClick={exporterToutVersCalendrier} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CalendarMonthIcon sx={{ fontSize: '1rem' }} />
                  Calendrier
                </button>
              </Tooltip>
              {seancesSelectionnees.length > 0 && (
                <>
                  <button className="btn-primary" onClick={exporterSelection}>
                    Exporter la sélection ({seancesSelectionnees.length})
                  </button>
                  <Tooltip title="Exporter la sélection vers Google Calendar (fichier .ics)">
                    <button className="btn-primary" onClick={exporterSelectionVersCalendrier} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <CalendarMonthIcon sx={{ fontSize: '1rem' }} />
                      Calendrier ({seancesSelectionnees.length})
                    </button>
                  </Tooltip>
                </>
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
          {historique.length > 0 && allureMarathon && (
            <>
              <Tooltip title="Recalculer toutes les séries avec % Allure Marathon selon l'allure marathon actuelle">
                <button className="btn-primary" onClick={actualiserTout}>
                  <RefreshIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
                  Actualiser tout
                </button>
              </Tooltip>
              {seancesSelectionnees.length > 0 && (
                <Tooltip title="Recalculer les séances sélectionnées avec % Allure Marathon">
                  <button className="btn-primary" onClick={actualiserSelection}>
                    <RefreshIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
                    Actualiser la sélection ({seancesSelectionnees.length})
                  </button>
                </Tooltip>
              )}
            </>
          )}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                  <div className="historique-info">
                    <strong>{seance.nom}</strong>
                    {seance.dateSeance && (
                      <span className="date-seance">
                        <EventIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        {new Date(seance.dateSeance).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                    <span>
                      {(() => {
                        const distanceResult = calculerDistanceTotaleSeance(seance)
                        if (distanceResult.isRange) {
                          return `${(distanceResult.min / 1000).toFixed(2)} - ${(distanceResult.max / 1000).toFixed(2)} km`
                        }
                        return `${(distanceResult / 1000).toFixed(2)} km`
                      })()}
                    </span>
                    {(() => {
                      const dureeResult = calculerDureeTotaleSeance(seance)
                      if (dureeResult.isRange) {
                        if (dureeResult.min > 0 || dureeResult.max > 0) {
                          return (
                            <span>
                              {formaterTempsLisible(formaterTemps(dureeResult.min))} - {formaterTempsLisible(formaterTemps(dureeResult.max))}
                            </span>
                          )
                        }
                      } else if (dureeResult > 0) {
                        return <span>{formaterTempsLisible(formaterTemps(dureeResult))}</span>
                      }
                      return null
                    })()}
                  </div>

                  {seancesDetailsOuvertes.includes(seance.id) && (
                    <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '6px', fontSize: '0.9rem' }}>
                      <div style={{ marginBottom: '0.75rem', color: '#6c757d' }}>
                        <span>Créée le {new Date(seance.dateCreation).toLocaleDateString('fr-FR')}</span>
                      </div>

                      {seance.commentaire && (
                        <div style={{ marginBottom: '1rem', fontStyle: 'italic', color: '#495057', background: 'white', padding: '0.75rem', borderRadius: '4px', borderLeft: '3px solid #007bff' }}>
                          <CommentIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                          {seance.commentaire}
                        </div>
                      )}

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {seance.blocs.map((bloc, indexBloc) => {
                          const repetitionsBloc = parseInt(bloc.repetitions) || 1
                          const blocType = bloc.type || 'course'
                          return (
                            <div key={indexBloc} style={{ background: 'white', padding: '0.75rem', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                              <div style={{ fontWeight: 600, color: '#495057', marginBottom: '0.5rem' }}>
                                {(() => {
                                  // Calculer le numéro de course
                                  const numeroCourse = seance.blocs.slice(0, indexBloc + 1).filter(b => (b.type || 'course') === 'course').length
                                  const label = getBlocTypeLabel(blocType, blocType === 'course' ? numeroCourse : null)
                                  return blocType === 'course' && repetitionsBloc > 1 ? `${label} (×${repetitionsBloc})` : label
                                })()}
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                {bloc.series.map((serie, indexSerie) => {
                                  const repetitionsSerie = parseInt(serie.repetitions) || 1
                                  const distance = parseFloat(serie.distance) || 0
                                  const distanceTotale = distance * repetitionsSerie * repetitionsBloc

                                  const serieElements = []

                                  // Affichage de la série
                                  if (serie.typePlage === 'plage') {
                                    const distanceMin = parseFloat(serie.distanceMin || serie.distance) || 0
                                    const distanceMax = parseFloat(serie.distanceMax || serie.distance) || 0
                                    const distanceTotaleMin = distanceMin * repetitionsSerie * repetitionsBloc
                                    const distanceTotaleMax = distanceMax * repetitionsSerie * repetitionsBloc

                                    serieElements.push(
                                      <div key={`serie-${indexSerie}`} style={{ paddingLeft: '1rem', color: '#495057' }}>
                                        {serie.estRecuperation && <HotelIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: '4px' }} />}
                                        • {blocType === 'course' && `${repetitionsSerie}× `}{serie.distanceMin && serie.distanceMax ? `${distanceMin}-${distanceMax}m` : `${distance}m`}
                                        {serie.allureMin && serie.allureMax && ` @ ${serie.allureMin}-${serie.allureMax}/km`}
                                        {serie.pourcentageVMAMin && serie.pourcentageVMAMax && ` (${serie.pourcentageVMAMin}-${serie.pourcentageVMAMax}% VMA)`}
                                        {serie.tempsMin && serie.tempsMax && ` en ${formaterTempsLisible(serie.tempsMin)}-${formaterTempsLisible(serie.tempsMax)}`}
                                        <span style={{ color: '#6610f2', fontWeight: 500, marginLeft: '0.5rem' }}>
                                          = {(distanceTotaleMin / 1000).toFixed(2)} - {(distanceTotaleMax / 1000).toFixed(2)}km
                                        </span>
                                      </div>
                                    )
                                  } else {
                                    serieElements.push(
                                      <div key={`serie-${indexSerie}`} style={{ paddingLeft: '1rem', color: '#495057' }}>
                                        {serie.estRecuperation && <HotelIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: '4px' }} />}
                                        • {blocType === 'course' && `${repetitionsSerie}× `}{distance}m
                                        {serie.allure && ` @ ${serie.allure}/km`}
                                        {serie.pourcentageVMA && ` (${serie.pourcentageVMA}% VMA)`}
                                        {serie.temps && ` en ${formaterTempsLisible(serie.temps)}`}
                                        <span style={{ color: '#6610f2', fontWeight: 500, marginLeft: '0.5rem' }}>
                                          = {(distanceTotale / 1000).toFixed(2)}km
                                        </span>
                                      </div>
                                    )
                                  }

                                  // Affichage de la récupération attachée à la série (seulement pour les blocs de type 'course')
                                  if (serie.recuperation && !serie.estRecuperation && blocType === 'course') {
                                    const recup = serie.recuperation
                                    const distanceRecup = parseFloat(recup.distance) || 0
                                    const distanceTotaleRecup = distanceRecup * repetitionsSerie * repetitionsBloc

                                    if (recup.typePlage === 'plage') {
                                      const distanceMinRecup = parseFloat(recup.distanceMin || recup.distance) || 0
                                      const distanceMaxRecup = parseFloat(recup.distanceMax || recup.distance) || 0
                                      const distanceTotaleMinRecup = distanceMinRecup * repetitionsSerie * repetitionsBloc
                                      const distanceTotaleMaxRecup = distanceMaxRecup * repetitionsSerie * repetitionsBloc

                                      serieElements.push(
                                        <div key={`recup-${indexSerie}`} style={{ paddingLeft: '2rem', color: '#6c757d', fontStyle: 'italic' }}>
                                          <HotelIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                          • {blocType === 'course' && `${repetitionsSerie}× `}{recup.distanceMin && recup.distanceMax ? `${distanceMinRecup}-${distanceMaxRecup}m` : `${distanceRecup}m`}
                                          {recup.allureMin && recup.allureMax && ` @ ${recup.allureMin}-${recup.allureMax}/km`}
                                          {recup.pourcentageVMAMin && recup.pourcentageVMAMax && ` (${recup.pourcentageVMAMin}-${recup.pourcentageVMAMax}% VMA)`}
                                          {recup.tempsMin && recup.tempsMax && ` en ${formaterTempsLisible(recup.tempsMin)}-${formaterTempsLisible(recup.tempsMax)}`}
                                          <span style={{ color: '#6610f2', fontWeight: 500, marginLeft: '0.5rem' }}>
                                            = {(distanceTotaleMinRecup / 1000).toFixed(2)} - {(distanceTotaleMaxRecup / 1000).toFixed(2)}km
                                          </span>
                                        </div>
                                      )
                                    } else {
                                      serieElements.push(
                                        <div key={`recup-${indexSerie}`} style={{ paddingLeft: '2rem', color: '#6c757d', fontStyle: 'italic' }}>
                                          <HotelIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                          • {blocType === 'course' && `${repetitionsSerie}× `}{distanceRecup}m
                                          {recup.allure && ` @ ${recup.allure}/km`}
                                          {recup.pourcentageVMA && ` (${recup.pourcentageVMA}% VMA)`}
                                          {recup.temps && ` en ${formaterTempsLisible(recup.temps)}`}
                                          <span style={{ color: '#6610f2', fontWeight: 500, marginLeft: '0.5rem' }}>
                                            = {(distanceTotaleRecup / 1000).toFixed(2)}km
                                          </span>
                                        </div>
                                      )
                                    }
                                  }

                                  return serieElements
                                })}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <div style={{ marginTop: '0.75rem', fontWeight: 600, color: '#6610f2', textAlign: 'right' }}>
                        Distance totale: {(() => {
                          const distanceResult = calculerDistanceTotaleSeance(seance)
                          if (distanceResult.isRange) {
                            return `${(distanceResult.min / 1000).toFixed(2)} - ${(distanceResult.max / 1000).toFixed(2)} km`
                          }
                          return `${(distanceResult / 1000).toFixed(2)} km`
                        })()}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => toggleDetailsSeance(seance.id)}
                      style={{
                        alignSelf: 'flex-start',
                        background: 'transparent',
                        border: '1px solid #007bff',
                        color: '#007bff',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      {seancesDetailsOuvertes.includes(seance.id) ? (
                        <>
                          <VisibilityOffIcon fontSize="small" /> Masquer les détails <ExpandLessIcon fontSize="small" />
                        </>
                      ) : (
                        <>
                          <VisibilityIcon fontSize="small" /> Voir les détails <ExpandMoreIcon fontSize="small" />
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => voirResumeSeance(seance)}
                      style={{
                        alignSelf: 'flex-start',
                        background: 'transparent',
                        border: '1px solid #17a2b8',
                        color: '#17a2b8',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <SummarizeIcon fontSize="small" /> Voir le résumé
                    </button>
                  </div>
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
                {allureMarathon && (
                  <Tooltip title="Actualiser cette séance avec l'allure marathon actuelle">
                    <IconButton
                      onClick={() => actualiserSeanceHistorique(seance.id)}
                      size="small"
                      color="primary"
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Exporter cette séance (JSON)">
                  <IconButton
                    onClick={() => exporterSeanceIndividuelle(seance)}
                    size="small"
                    color="default"
                  >
                    <FileDownloadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Exporter vers Google Calendar (.ics)">
                  <IconButton
                    onClick={() => exporterSeanceVersCalendrier(seance)}
                    size="small"
                    color="primary"
                  >
                    <CalendarMonthIcon />
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
