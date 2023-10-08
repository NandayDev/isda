# I Soldi degli Altri
Progetto creato per votare e tenere traccia dei voti della serie "I Soldi degli Altri" di Mr. Rip.

## Tecnologie e framework
- [Next.js](https://nextjs.org/): Per parte frontend e API
- [Prisma](https://www.prisma.io/): ORM per database
- [Supabase](https://supabase.io/): Database e autenticazione
- [Chakra UI](https://chakra-ui.com/): Componenti UI

## Come testare in locale
1. Clona il repository.
2. Lancia `yarn install` per installare le dipendenze.
3. Crea un progetto su Supabase con database PostgreSQL.
4. Crea un file `.env.local` con le variabili d'ambiente di esempio presenti nel file `.env.example`.
5. Lancia `yarn prisma migrate dev` per applicare le migrazioni al database.
6. Crea un bucket pubblico su Supabase per le immagini.
7. Crea un progetto su supabase e lancia i comandi del file `supabase.sql`.
8. Lancia `yarn dev` per avviare il server in locale.

## Come contribuire
1. Crea un fork del repository.
2. Crea un branch con il nome della feature che vuoi aggiungere.
3. Fai le modifiche.
4. Fai una pull request.
5. Attendi che la pull request venga approvata e mergiata.

## Licenza
Questo progetto è sotto licenza MIT. Per maggiori informazioni leggi il file [LICENSE](LICENSE).