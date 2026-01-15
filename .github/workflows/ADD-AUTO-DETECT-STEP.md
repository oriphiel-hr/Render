# 🔧 Dodaj Auto-Detection Korak u Workflow

## 📋 Upute

Dodaj ovaj korak **PRIJE** "Determine SERVER_DIR based on structure" koraka (oko linije 211):

```yaml
      - name: Auto-detect FTP structure
        id: detect-ftp
        continue-on-error: true
        env:
          FTP_HOST: ${{ env.FTP_HOST }}
          FTP_USER: ${{ env.FTP_USER }}
          FTP_PASS: ${{ env.FTP_PASS }}
          HOSTINGER_SERVER_DIR: ${{ secrets.HOSTINGER_SERVER_DIR }}
        run: |
          echo "🔍 Auto-detecting FTP structure..."
          python3 << 'PYTHON_SCRIPT'
          import ftplib, sys, os
          ftp_host = os.environ.get('FTP_HOST')
          ftp_user = os.environ.get('FTP_USER')
          ftp_pass = os.environ.get('FTP_PASS')
          secret_value = os.environ.get('HOSTINGER_SERVER_DIR', '')
          if not all([ftp_host, ftp_user, ftp_pass]):
              determined_dir = "public_html/"
          else:
              try:
                  ftp = ftplib.FTP(ftp_host, timeout=10)
                  ftp.login(ftp_user, ftp_pass)
                  current_dir = ftp.pwd()
                  print(f"✅ Connected! Current directory: {current_dir}")
                  in_public_html = "public_html" in current_dir.lower()
                  public_html_exists = False
                  try:
                      ftp.cwd('public_html')
                      public_html_dir = ftp.pwd()
                      print(f"✅ public_html/ exists! Directory: {public_html_dir}")
                      public_html_exists = True
                      ftp.cwd('..')
                  except:
                      pass
                  if in_public_html:
                      determined_dir = "/"
                      print(f"✅ DETECTION: FTP root is already IN public_html/")
                  elif public_html_exists:
                      determined_dir = "public_html/"
                      print(f"✅ DETECTION: public_html/ folder exists, FTP root is above it")
                  else:
                      determined_dir = secret_value if secret_value else "public_html/"
                  ftp.quit()
              except Exception as e:
                  print(f"❌ Error: {e}")
                  determined_dir = secret_value if secret_value else "public_html/"
          if determined_dir != "/" and not determined_dir.endswith("/"):
              determined_dir += "/"
          print(f"✅ FINAL SERVER_DIR: '{determined_dir}'")
          github_env = os.environ.get('GITHUB_ENV')
          if github_env:
              with open(github_env, 'a') as f:
                  f.write(f"SERVER_DIR={determined_dir}\n")
          github_output = os.environ.get('GITHUB_OUTPUT')
          if github_output:
              with open(github_output, 'a') as f:
                  f.write(f"detected_dir={determined_dir}\n")
          PYTHON_SCRIPT
```

Zatim ažuriraj "Determine SERVER_DIR" korak da koristi rezultat:

```yaml
      - name: Determine SERVER_DIR based on structure
        id: determine-dir
        run: |
          if [ -n "${{ steps.detect-ftp.outputs.detected_dir }}" ]; then
            DETERMINED_DIR="${{ steps.detect-ftp.outputs.detected_dir }}"
            echo "✅ Using auto-detected SERVER_DIR: '$DETERMINED_DIR'"
          elif [ -n "${{ secrets.HOSTINGER_SERVER_DIR }}" ]; then
            DETERMINED_DIR="${{ secrets.HOSTINGER_SERVER_DIR }}"
            echo "✅ Using secret SERVER_DIR: '$DETERMINED_DIR'"
          else
            DETERMINED_DIR="public_html/"
            echo "✅ Using default SERVER_DIR: '$DETERMINED_DIR'"
          fi
          if [ "$DETERMINED_DIR" != "/" ] && [[ "$DETERMINED_DIR" != */ ]]; then
            DETERMINED_DIR="${DETERMINED_DIR}/"
          fi
          echo "SERVER_DIR=$DETERMINED_DIR" >> $GITHUB_ENV
          echo "determined_dir=$DETERMINED_DIR" >> $GITHUB_OUTPUT
          echo "✅ Final SERVER_DIR: '$DETERMINED_DIR'"
```

---

**Gotovo!** 🎯


