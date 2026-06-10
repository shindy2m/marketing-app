import Dexie from 'dexie'

// Lokální databáze v telefonu (IndexedDB přes Dexie).
export const db = new Dexie('veletrh-kontakty')

db.version(1).stores({
  // ++id = auto-increment; ostatní pole jsou indexovaná pro vyhledávání
  contacts: '++id, jmeno, firma, email, akce, vytvoreno'
})

export async function addContact(contact) {
  return db.contacts.add({
    ...contact,
    vytvoreno: contact.vytvoreno || new Date().toISOString()
  })
}

export async function updateContact(id, changes) {
  return db.contacts.update(id, changes)
}

export async function deleteContact(id) {
  return db.contacts.delete(id)
}

export async function getAllContacts() {
  return db.contacts.orderBy('vytvoreno').reverse().toArray()
}

export async function countContacts() {
  return db.contacts.count()
}
