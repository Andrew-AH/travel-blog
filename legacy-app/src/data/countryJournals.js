import { destinations } from './destinations.js'
import { posts } from './posts.js'

const journalsByCountry = new Map()

for (const place of destinations) {
  if (!journalsByCountry.has(place.country)) {
    journalsByCountry.set(place.country, {
      name: place.country,
      slug: place.country.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      places: [],
      cover: place,
    })
  }
  journalsByCountry.get(place.country).places.push(place)
}

export const countryJournals = [...journalsByCountry.values()]

export function getCountryJournal(slug) {
  return countryJournals.find(journal => journal.slug === slug)
}

export function countryJournalPath(countryName) {
  const journal = journalsByCountry.get(countryName)
  return journal ? `/destinations/${journal.slug}` : '/destinations'
}

export function getCountryPosts(countryName) {
  return posts.filter(post => post.country === countryName)
}
