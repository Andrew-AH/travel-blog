import { createRoot } from 'react-dom/client'
import Atlas from './Atlas'
import PackingChecklist from './components/PackingChecklist'
import TravelSafetyCheck from './components/TravelSafetyCheck'
import TravelEntryCheck from './components/TravelEntryCheck'
import './country-journal.css'
import './tools.css'

const components = { 'destination-atlas': Atlas, 'packing-checklist': PackingChecklist, 'travel-safety': TravelSafetyCheck, 'travel-entry': TravelEntryCheck }
function mountTools() {
  document.querySelectorAll('[data-wei-widget]').forEach(element => {
    if (element.dataset.weiMounted) return
    const Component = components[element.dataset.weiWidget]
    if (!Component) return
    try {
      const props = JSON.parse(element.querySelector('.wei-widget-data').textContent)
      const target = element.querySelector('.wei-widget-content')
      element.dataset.weiMounted = 'true'
      createRoot(target).render(<Component {...props} />)
    } catch (error) { console.warn('The travel tool could not start; its accessible fallback is still available.', error) }
  })
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountTools, { once: true })
else mountTools()
