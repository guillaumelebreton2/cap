import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [vma, setVma] = useState('')
  const [blocs, setBlocs] = useState([])
  const [historique, setHistorique] = useState([])
  const [nomSeance, setNomSeance] = useState('')
  const [dateSeance, setDateSeance] = useState('')

  // Charger l'historique depuis localStorage au démarrage
  useEffect(() => {
    const historiqueStocke = localStorage.getItem('plan-marathon-historique')
    if (historiqueStocke) {
      setHistorique(JSON.parse(historiqueStocke))
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

  // Charger une séance depuis l'historique
  const chargerSeance = (seance) => {
    setVma(seance.vma || '')
    setBlocs(seance.blocs)
    setNomSeance(seance.nom || '')
    setDateSeance(seance.dateSeance || '')
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

  // Extraire les heures d'un temps formaté
  const extraireHeures = (tempsStr) => {
    if (!tempsStr) return ''
    const parts = tempsStr.split(':')
    if (parts.length === 3) return parts[0] || ''
    return ''
  }

  // Extraire les minutes d'un temps formaté
  const extraireMinutes = (tempsStr) => {
    if (!tempsStr) return ''
    const parts = tempsStr.split(':')
    if (parts.length === 3) return parts[1] || ''
    if (parts.length === 2) return parts[0] || ''
    return ''
  }

  // Extraire les secondes d'un temps formaté
  const extraireSecondes = (tempsStr) => {
    if (!tempsStr) return ''
    const parts = tempsStr.split(':')
    if (parts.length === 2) return parts[1] || ''
    if (parts.length === 3) return parts[2] || ''
    return ''
  }

  // Mettre à jour le temps d'une série avec heures, minutes et secondes séparées
  const updateTemps = (indexBloc, indexSerie, typeTemps, typeValeur, value) => {
    const nouveauxBlocs = [...blocs]
    const serie = { ...nouveauxBlocs[indexBloc].series[indexSerie] }

    // Récupérer les valeurs actuelles
    const tempsActuel = serie[typeTemps] || ''
    const heuresActuelles = extraireHeures(tempsActuel)
    const minutesActuelles = extraireMinutes(tempsActuel)
    const secondesActuelles = extraireSecondes(tempsActuel)

    // Mettre à jour la valeur appropriée
    const heures = typeValeur === 'heures' ? value : heuresActuelles
    const minutes = typeValeur === 'minutes' ? value : minutesActuelles
    const secondes = typeValeur === 'secondes' ? value : secondesActuelles

    // Formater le nouveau temps
    let newTemps = ''
    if (heures || minutes || secondes) {
      if (heures) {
        // Format h:mm:ss
        newTemps = `${heures}:${(minutes || '0').padStart(2, '0')}:${(secondes || '0').padStart(2, '0')}`
      } else {
        // Format mm:ss
        newTemps = `${minutes || '0'}:${(secondes || '0').padStart(2, '0')}`
      }
    }

    // Utiliser updateSerie pour mettre à jour
    updateSerie(indexBloc, indexSerie, typeTemps, newTemps)
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

  // Sauvegarder la séance
  const sauvegarderSeance = () => {
    if (!nomSeance.trim()) {
      alert('Veuillez donner un nom à la séance')
      return
    }
    sauvegarderHistorique({ nom: nomSeance, vma, blocs, dateSeance })
    alert('Séance sauvegardée !')
  }

  return (
    <div className="app">
      <h1>Plan Marathon - Calculateur d'allures</h1>

      <div className="top-section">
        <div className="form-group">
          <label>Nom de la séance</label>
          <input
            type="text"
            value={nomSeance}
            onChange={(e) => setNomSeance(e.target.value)}
            placeholder="Ex: Séance VMA"
          />
        </div>
        <div className="form-group">
          <label>Date de la séance</label>
          <input
            type="date"
            value={dateSeance}
            onChange={(e) => setDateSeance(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>VMA (km/h)</label>
          <input
            type="number"
            step="0.1"
            value={vma}
            onChange={(e) => setVma(e.target.value)}
            placeholder="Ex: 16"
          />
        </div>
        <button className="btn-primary" onClick={ajouterBloc}>+ Ajouter un bloc</button>
        <button className="btn-success" onClick={sauvegarderSeance} disabled={blocs.length === 0}>Sauvegarder</button>
      </div>

      {blocs.map((bloc, indexBloc) => (
        <div key={indexBloc} className="bloc-container">
          <div className="bloc-header">
            <div className="bloc-title">
              <h2>Bloc {indexBloc + 1}</h2>
              <div className="form-group-inline">
                <label>Répétitions du bloc:</label>
                <input
                  type="number"
                  min="1"
                  value={bloc.repetitions}
                  onChange={(e) => updateRepetitionsBloc(indexBloc, e.target.value)}
                  className="input-small"
                />
              </div>
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
                  <div className="form-group-inline">
                    <label>×</label>
                    <input
                      type="number"
                      min="1"
                      value={serie.repetitions}
                      onChange={(e) => updateSerie(indexBloc, indexSerie, 'repetitions', e.target.value)}
                      className="input-tiny"
                    />
                  </div>
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
                <>
                  <div className="form-group distance-field">
                    <label>Distance principale (m) - optionnel</label>
                    <input
                      type="number"
                      value={serie.distance}
                      onChange={(e) => updateSerie(indexBloc, indexSerie, 'distance', e.target.value)}
                      placeholder="400"
                    />
                    <span className="helper-text-info">Rempli automatiquement min et max si vides</span>
                  </div>
                  <div className="form-group distance-field">
                    <label>Temps principal - optionnel</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        type="number"
                        min="0"
                        value={extraireHeures(serie.temps)}
                        onChange={(e) => updateTemps(indexBloc, indexSerie, 'temps', 'heures', e.target.value)}
                        placeholder="0"
                        className="input-small"
                        style={{ width: '45px' }}
                      />
                      <span>h</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={extraireMinutes(serie.temps)}
                        onChange={(e) => updateTemps(indexBloc, indexSerie, 'temps', 'minutes', e.target.value)}
                        placeholder="0"
                        className="input-small"
                        style={{ width: '45px' }}
                      />
                      <span>min</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={extraireSecondes(serie.temps)}
                        onChange={(e) => updateTemps(indexBloc, indexSerie, 'temps', 'secondes', e.target.value)}
                        placeholder="00"
                        className="input-small"
                        style={{ width: '45px' }}
                      />
                      <span>s</span>
                    </div>
                    <span className="helper-text-info">Rempli automatiquement min et max si vides</span>
                  </div>
                </>
              )}

              {serie.typePlage === 'fixe' ? (
                <div className="serie-fields">
                  <div className="form-group">
                    <label>Distance (m)</label>
                    <input
                      type="number"
                      value={serie.distance}
                      onChange={(e) => updateSerie(indexBloc, indexSerie, 'distance', e.target.value)}
                      placeholder="400"
                    />
                  </div>
                  <div className="form-group">
                    <label>% VMA</label>
                    <input
                      type="number"
                      step="5"
                      value={serie.pourcentageVMA}
                      onChange={(e) => updateSerie(indexBloc, indexSerie, 'pourcentageVMA', e.target.value)}
                      placeholder="85"
                      disabled={!vma}
                    />
                  </div>
                  <div className="form-group">
                    <label>Allure (min:sec/km)</label>
                    <input
                      type="text"
                      value={serie.allure}
                      onChange={(e) => updateSerie(indexBloc, indexSerie, 'allure', e.target.value)}
                      placeholder="5:30"
                    />
                  </div>
                  <div className="form-group">
                    <label>Temps</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        type="number"
                        min="0"
                        value={extraireHeures(serie.temps)}
                        onChange={(e) => updateTemps(indexBloc, indexSerie, 'temps', 'heures', e.target.value)}
                        placeholder="0"
                        className="input-small"
                        style={{ width: '50px' }}
                      />
                      <span>h</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={extraireMinutes(serie.temps)}
                        onChange={(e) => updateTemps(indexBloc, indexSerie, 'temps', 'minutes', e.target.value)}
                        placeholder="0"
                        className="input-small"
                        style={{ width: '50px' }}
                      />
                      <span>min</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={extraireSecondes(serie.temps)}
                        onChange={(e) => updateTemps(indexBloc, indexSerie, 'temps', 'secondes', e.target.value)}
                        placeholder="00"
                        className="input-small"
                        style={{ width: '50px' }}
                      />
                      <span>s</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="serie-fields-plage">
                  <div className="plage-group">
                    <div className="plage-label">Min</div>
                    <div className="form-group">
                      <label>Distance (m)</label>
                      <input
                        type="number"
                        value={serie.distanceMin}
                        onChange={(e) => updateSerie(indexBloc, indexSerie, 'distanceMin', e.target.value)}
                        placeholder="400"
                      />
                      <span className="helper-text-info">Optionnel si différent</span>
                    </div>
                    <div className="form-group">
                      <label>% VMA</label>
                      <input
                        type="number"
                        step="5"
                        value={serie.pourcentageVMAMin}
                        onChange={(e) => updateSerie(indexBloc, indexSerie, 'pourcentageVMAMin', e.target.value)}
                        placeholder="80"
                        disabled={!vma}
                      />
                    </div>
                    <div className="form-group">
                      <label>Allure (min:sec/km)</label>
                      <input
                        type="text"
                        value={serie.allureMin}
                        onChange={(e) => updateSerie(indexBloc, indexSerie, 'allureMin', e.target.value)}
                        placeholder="5:00"
                      />
                    </div>
                    <div className="form-group">
                      <label>Temps</label>
                      <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input
                          type="number"
                          min="0"
                          value={extraireHeures(serie.tempsMin)}
                          onChange={(e) => updateTemps(indexBloc, indexSerie, 'tempsMin', 'heures', e.target.value)}
                          placeholder="0"
                          className="input-tiny"
                        />
                        <span style={{ fontSize: '0.8rem' }}>h</span>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={extraireMinutes(serie.tempsMin)}
                          onChange={(e) => updateTemps(indexBloc, indexSerie, 'tempsMin', 'minutes', e.target.value)}
                          placeholder="0"
                          className="input-tiny"
                        />
                        <span style={{ fontSize: '0.8rem' }}>min</span>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={extraireSecondes(serie.tempsMin)}
                          onChange={(e) => updateTemps(indexBloc, indexSerie, 'tempsMin', 'secondes', e.target.value)}
                          placeholder="00"
                          className="input-tiny"
                        />
                        <span style={{ fontSize: '0.8rem' }}>s</span>
                      </div>
                    </div>
                  </div>
                  <div className="plage-group">
                    <div className="plage-label">Max</div>
                    <div className="form-group">
                      <label>Distance (m)</label>
                      <input
                        type="number"
                        value={serie.distanceMax}
                        onChange={(e) => updateSerie(indexBloc, indexSerie, 'distanceMax', e.target.value)}
                        placeholder="450"
                      />
                      <span className="helper-text-info">Optionnel si différent</span>
                    </div>
                    <div className="form-group">
                      <label>% VMA</label>
                      <input
                        type="number"
                        step="5"
                        value={serie.pourcentageVMAMax}
                        onChange={(e) => updateSerie(indexBloc, indexSerie, 'pourcentageVMAMax', e.target.value)}
                        placeholder="90"
                        disabled={!vma}
                      />
                    </div>
                    <div className="form-group">
                      <label>Allure (min:sec/km)</label>
                      <input
                        type="text"
                        value={serie.allureMax}
                        onChange={(e) => updateSerie(indexBloc, indexSerie, 'allureMax', e.target.value)}
                        placeholder="5:30"
                      />
                    </div>
                    <div className="form-group">
                      <label>Temps</label>
                      <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input
                          type="number"
                          min="0"
                          value={extraireHeures(serie.tempsMax)}
                          onChange={(e) => updateTemps(indexBloc, indexSerie, 'tempsMax', 'heures', e.target.value)}
                          placeholder="0"
                          className="input-tiny"
                        />
                        <span style={{ fontSize: '0.8rem' }}>h</span>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={extraireMinutes(serie.tempsMax)}
                          onChange={(e) => updateTemps(indexBloc, indexSerie, 'tempsMax', 'minutes', e.target.value)}
                          placeholder="0"
                          className="input-tiny"
                        />
                        <span style={{ fontSize: '0.8rem' }}>min</span>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={extraireSecondes(serie.tempsMax)}
                          onChange={(e) => updateTemps(indexBloc, indexSerie, 'tempsMax', 'secondes', e.target.value)}
                          placeholder="00"
                          className="input-tiny"
                        />
                        <span style={{ fontSize: '0.8rem' }}>s</span>
                      </div>
                    </div>
                  </div>
                </div>
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

      {historique.length > 0 && (
        <div className="historique-section">
          <h2>Historique des séances</h2>
          {historique.map((seance) => (
            <div key={seance.id} className="historique-item">
              <div className="historique-info">
                <strong>{seance.nom}</strong>
                {seance.dateSeance && (
                  <span className="date-seance">📅 {new Date(seance.dateSeance).toLocaleDateString('fr-FR')}</span>
                )}
                <span className="date-creation">Créée le {new Date(seance.dateCreation).toLocaleDateString('fr-FR')}</span>
                <span>VMA: {seance.vma} km/h</span>
                <span>{seance.blocs.length} bloc(s)</span>
              </div>
              <div className="historique-actions">
                <button className="btn-secondary" onClick={() => chargerSeance(seance)}>Charger</button>
                <button className="btn-danger" onClick={() => supprimerSeance(seance.id)}>Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App
