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
        return "public_html/"  # Default fallback
    
    try:
        print(f"🔌 Connecting to {ftp_host}...")
        ftp = ftplib.FTP(ftp_host, timeout=10)
        ftp.login(ftp_user, ftp_pass)
        
        current_dir = ftp.pwd()
        print(f"✅ Connected! Current directory: {current_dir}")
        
        # Check if we're already IN public_html or if public_html exists as subdirectory
        current_dir_lower = current_dir.lower()
        in_public_html = current_dir_lower.endswith('/public_html') or current_dir_lower.endswith('/public_html/') or current_dir_lower == '/public_html'
        
        print(f"\n📁 Listing current directory:")
        files = []
        dirs = []
        try:
            for item in ftp.nlst():
                # Try to determine if it's a directory
                try:
                    ftp.cwd(item)
                    dirs.append(item)
                    ftp.cwd('..')
                except:
                    files.append(item)
            for d in dirs[:10]:
                print(f"   DIR: {d}")
            for f in files[:5]:
                print(f"   FILE: {f}")
        except Exception as e:
            print(f"   Error listing: {e}")
        
        public_html_exists = False
        public_html_path = None
        try:
            # Try to navigate to public_html
            original_dir = ftp.pwd()
            try:
                ftp.cwd('public_html')
                public_html_path = ftp.pwd()
                print(f"\n✅ public_html/ exists as SUBDIRECTORY! Directory: {public_html_path}")
                public_html_exists = True
                ftp.cwd(original_dir)
            except:
                # If we can't navigate, check if we're already there
                if 'public_html' in original_dir.lower():
                    public_html_path = original_dir
                    print(f"\n✅ We are already IN public_html/ directory: {public_html_path}")
                    in_public_html = True
                else:
                    print(f"\n⚠️  public_html/ folder not found")
        except ftplib.error_perm as e:
            print(f"\n⚠️  Cannot check public_html/: {e}")
        
        # Determine the correct directory
        if in_public_html:
            # We're already in public_html/, so use "/" (current directory)
            determined_dir = "/"
            print(f"\n✅ DETECTION: FTP root is already IN public_html/")
            print(f"   Current dir: {current_dir}")
            print(f"   → Will use '/' (upload to current directory = public_html/)")
        elif public_html_exists and not in_public_html:
            # public_html/ exists as subdirectory, we need to navigate to it
            determined_dir = "public_html/"
            print(f"\n✅ DETECTION: public_html/ folder exists, FTP root is above it")
            print(f"   Current dir: {current_dir}")
            print(f"   → Will use 'public_html/' (upload to public_html/)")
        else:
            # Fallback to secret or default
            if secret_value:
                determined_dir = secret_value
                print(f"\n⚠️  Could not detect structure, using secret: '{secret_value}'")
            else:
                # Default: assume public_html/ exists
                determined_dir = "public_html/"
                print(f"\n⚠️  Could not detect structure, using default: 'public_html/'")
        
        # Ensure trailing slash (except for "/")
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
            determined_dir = "public_html/"
        
        if determined_dir != "/" and not determined_dir.endswith("/"):
            determined_dir += "/"
        
        print(f"✅ Using fallback SERVER_DIR: '{determined_dir}'")
        return determined_dir

if __name__ == "__main__":
    result = detect_ftp_structure()
    
    # Removed: SERVER_DIR should only be set in Determine SERVER_DIR step, not here
    # This prevents duplication of public_html/public_html/
    
    # Save to output only (not to GITHUB_ENV)
    github_output = os.environ.get('GITHUB_OUTPUT')
    if github_output:
        with open(github_output, 'a') as f:
            f.write(f"detected_dir={result}\n")
    
    sys.exit(0)
