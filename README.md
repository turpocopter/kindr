# Kindr

Frontend Vue + backend minimal via Supabase:
- comptes utilisateurs (email + mot de passe)
- upload de produits (photo + date `created_at`)
- enregistrement des `like` / `dislike`
- detection de match quand 2 produits se likent mutuellement

## 1) Setup Supabase

1. Cree un projet Supabase.
2. Dans SQL Editor, execute le script [supabase/schema.sql](supabase/schema.sql).
3. Dans Authentication > Providers, laisse Email actif.
4. Dans Project Settings > API, recupere:
	- `Project URL`
	- `anon public key`

## 2) Variables d'environnement

Copie `.env.example` vers `.env` et renseigne les valeurs:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## 3) Lancer le projet

```bash
npm install
npm run dev
```

## Notes

- Le bucket storage utilise le nom `toy-photos`.
- Les policies RLS autorisent uniquement la creation/mise a jour/suppression de ses propres produits et reactions.
- Les photos sont publiques en lecture pour simplifier le MVP.
