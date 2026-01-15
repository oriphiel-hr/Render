#!/usr/bin/env python3
"""
FTP Structure Detection Script
Detects FTP structure and determines correct SERVER_DIR
"""
import ftplib
import sys
import os

def detect_ftp_structure():
    ftp_host = os.environ.get('FTP_HOST')
    ftp_user = os.environ.get('FTP_USER')
    ftp_pass = os.environ.get('FTP_PASS')
    secret_value = os.environ.get('HOSTINGER_SERVER_DIR', '')
    
    if not all([ftp_host, ftp_user, ftp_pass]):
        print("❌ Missing FTP credentials")
        return "/"  # Default fallback - avoid duplicate public_html/public_html/
    
    try:
        print(f"🔌 Connecting to {ftp_host}...")
        ftp = ftplib.FTP(ftp_host, timeout=10)
        ftp.login(ftp_user, ftp_pass)
        
        current_dir = ftp.pwd()
        print(f"✅ Connected! Current directory: {current_dir}")
        
        in_public_html = "public_html" in current_dir.lower()
        
        print(f"\n📁 Listing current directory:")
        files = []
        try:
            ftp.retrlines('LIST', files.append)
            for line in files[:10]:
                print(f"   {line}")
        except:
            pass
        
        public_html_exists = False
        try:
            ftp.cwd('public_html')
            public_html_dir = ftp.pwd()
            print(f"\n✅ public_html/ exists! Directory: {public_html_dir}")
            public_html_exists = True
            ftp.cwd('..')
        except ftplib.error_perm:
            print(f"\n⚠️  public_html/ folder not found in current directory")
        
        if in_public_html:
            determined_dir = "/"
            print(f"\n✅ DETECTION: FTP root is already IN public_html/")
            print(f"   → Will use '/' (upload to current directory = public_html/)")
        elif public_html_exists:
            determined_dir = "/"  # Default to "/" to avoid duplicate
            print(f"\n✅ DETECTION: public_html/ folder exists, FTP root is above it")
            print(f"   → Will use 'public_html/' (upload to public_html/)")
        else:
            if secret_value:
                determined_dir = secret_value
                print(f"\n⚠️  Could not detect structure, using secret: '{secret_value}'")
            else:
                determined_dir = "/"  # Default to "/" to avoid duplicate
                print(f"\n⚠️  Could not detect structure, using default: 'public_html/'")
        
        if determined_dir != "/" and not determined_dir.endswith("/"):
            determined_dir += "/"
        
        print(f"\n✅ FINAL SERVER_DIR: '{determined_dir}'")
        
        ftp.quit()
        return determined_dir
        
    except Exception as e:
        print(f"❌ Error connecting to FTP: {e}")
        print(f"\n⚠️  Falling back to secret or default...")
        
        if secret_value:
            determined_dir = secret_value
        else:
            determined_dir = "/"  # Default to "/" to avoid duplicate
        
        if determined_dir != "/" and not determined_dir.endswith("/"):
            determined_dir += "/"
        
        print(f"✅ Using fallback SERVER_DIR: '{determined_dir}'")
        return determined_dir

if __name__ == "__main__":
    result = detect_ftp_structure()
    
    # Save to environment
    github_env = os.environ.get('GITHUB_ENV')
    if github_env:
        with open(github_env, 'a') as f:
            f.write(f"SERVER_DIR={result}\n")
    
    # Save to output
    github_output = os.environ.get('GITHUB_OUTPUT')
    if github_output:
        with open(github_output, 'a') as f:
            f.write(f"determined_dir={result}\n")
    
    sys.exit(0)

