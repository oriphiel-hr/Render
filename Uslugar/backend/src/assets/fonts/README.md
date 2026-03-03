# Font za PDF fakture (Unicode: ć, č, ž, š, đ)

Kopiraj ovdje `DejaVuSans.ttf` da bi se pouzdano uključio u deploy na Renderu.

Npr. iz korijena backend-a:
```bash
cp fonts/DejaVuSans.ttf src/assets/fonts/
```

Zatim commit i push:
```bash
git add src/assets/fonts/DejaVuSans.ttf
git commit -m "Font za fakture u src za deploy"
git push
```
