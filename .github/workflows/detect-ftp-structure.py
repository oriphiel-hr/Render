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
        
        # First, try to check if public_html exists as a subdirectory
        # This is the most reliable check
        public_html_exists = False
        original_dir = current_dir
        
        try:
            ftp.cwd('public_html')
            public_html_dir = ftp.pwd()
            print(f"\n✅ public_html/ exists as SUBDIRECTORY!")
            print(f"   From '{original_dir}' navigated to '{public_html_dir}'")
            public_html_exists = True
            ftp.cwd(original_dir)  # Go back to original
        except ftplib.error_perm as e:
            print(f"\n⚠️  Cannot navigate to public_html/ as subdirectory: {e}")
            public_html_exists = False
        
        # Check if we're already IN public_html by checking the path
        # Only trust this if we couldn't navigate to public_html as subdirectory
        in_public_html = False
        if not public_html_exists:
            current_dir_lower = current_dir.lower().rstrip('/')
            # Check if path ends with /public_html or equals /public_html
            if (current_dir_lower.endswith('/public_html') or 
                current_dir_lower == '/public_html' or
                current_dir_lower.endswith('public_html')):
                in_public_html = True
                print(f"\n✅ Current directory appears to BE public_html/")
                print(f"   Current dir: {current_dir}")
        
        # Determine the correct directory based on detection
        if in_public_html and not public_html_exists:
            # We're already IN public_html/ (and it doesn't exist as subdirectory)
            determined_dir = "/"
            print(f"\n✅ DETECTION: FTP root is already IN public_html/")
            print(f"   → Will use '/' (upload to current directory = public_html/)")
        elif public_html_exists:
            # public_html/ exists as subdirectory, we need to navigate to it
            determined_dir = "public_html/"
            print(f"\n✅ DETECTION: public_html/ folder exists as subdirectory")
            print(f"   Current dir: {current_dir}")
            print(f"   → Will use 'public_html/' (navigate to public_html/ subdirectory)")
        else:
            # Neither detected - fallback to secret or default
            if secret_value:
                determined_dir = secret_value
                print(f"\n⚠️  Could not detect structure, using secret: '{secret_value}'")
            else:
                # Default: assume public_html/ exists as subdirectory (most common Hostinger case)
                determined_dir = "public_html/"
                print(f"\n⚠️  Could not detect structure, using default: 'public_html/'")
                print(f"   (Assuming public_html/ exists as subdirectory - most common case)")
        
        # Ensure trailing slash (except for "/")
        if determined_dir != "/" and not determined_dir.endswith("/"):
            determined_dir += "/"
        
        print(f"\n✅ FINAL SERVER_DIR: '{determined_dir}'")
        
        ftp.quit()
        return determined_dir
        
    except Exception as e:
        print(f"❌ Error connecting to FTP: {e}")
        import traceback
        traceback.print_exc()
        print(f"\n⚠️  Falling back to secret or default...")
        
        if secret_value:
            determined_dir = secret_value
        else:
            # Default to public_html/ - most common Hostinger case
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
