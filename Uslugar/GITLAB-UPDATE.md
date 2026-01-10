# 🔄 Ažuriranje Referenci u GitHub Repository-ju

## 📍 Repo Informacije

**Repository:** `https://github.com/oriphiel-hr/AWS_projekti`

**Napomena:** Repo je na **GitHub-u**, ne GitLab-u. Ako trebaš GitLab, javi se!

---

## ✅ Što Treba Ažurirati u Repo-u

### 1. README.md (ako postoji u root repo-a)

Ako postoji README.md u root-u repository-ja (`C:\GIT_PROJEKTI\AWS\AWS_projekti\README.md`), treba ažurirati reference:

**Prije:**
```markdown
Za Render.com migraciju, vidi: `uslugar_render/`
```

**Poslije:**
```markdown
Za Render.com migraciju, vidi: `uslugar_render/` (ili `C:\GIT_PROJEKTI\Render` lokalno)
```

### 2. Dokumentacija (ako postoji)

Provjeri da li ima referenci na stari path u:
- `uslugar/backend/README.md`
- `uslugar/frontend/README.md`
- Bilo koji drugi `.md` fajlovi

---

## 🔄 Kako Ažurirati

### Opcija 1: Lokalno (preporučeno)

```powershell
cd C:\GIT_PROJEKTI\AWS\AWS_projekti

# Provjeri reference
Get-ChildItem -Recurse -Include "*.md","*.txt" -Exclude "node_modules" | 
    Select-String -Pattern "AWS\\uslugar_render|uslugar_render" | 
    Select-Object -First 10

# Ažuriraj ako treba
Get-ChildItem -Recurse -Include "*.md" -Exclude "node_modules" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match "AWS\\uslugar_render") {
        # Ažuriraj ako potrebno
        Write-Host "Pronađen: $($_.Name)" -ForegroundColor Yellow
    }
}
```

### Opcija 2: Commit i Push Promjene

```powershell
cd C:\GIT_PROJEKTI\AWS\AWS_projekti

# Ako ima promjena u Render direktoriju, dodaj u git
git add uslugar_render/  # Ako postoji u repo-u
# Ili dodaj novi direktorij ako ga kopiraš u repo

git commit -m "docs: update Render.com migration paths"
git push origin main
```

---

## 📋 Checklist

- [ ] Provjeri da li postoji `uslugar_render/` u repo-u
- [ ] Ažuriraj reference u dokumentaciji (ako ih ima)
- [ ] Dodaj note o novoj lokaciji `C:\GIT_PROJEKTI\Render` (opcionalno)
- [ ] Commit i push promjene (ako ih ima)

---

## 💡 Preporuka

**Trenutno repo koristi:**
- GitHub: `https://github.com/oriphiel-hr/AWS_projekti`
- Lokalni path: `C:\GIT_PROJEKTI\AWS\AWS_projekti`

**Render.com migracija je lokalna** (`C:\GIT_PROJEKTI\Render`) i nije u Git repo-u. 

**Ako želiš Render migraciju u Git:**
1. Kopiraj `C:\GIT_PROJEKTI\Render` u `C:\GIT_PROJEKTI\AWS\AWS_projekti\render_migration/`
2. Commit i push

**Ili:** Ostavi lokalno (kako je sada) - nije potrebno u Git-u jer su to samo backup fajlovi i skripte.

---

**Ako imaš specifične reference koje treba ažurirati, javi se!**

