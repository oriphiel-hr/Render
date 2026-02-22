#!/bin/sh
# Cron: napuni sudreg_expected_counts (od max u bazi + 1 do max iz API-ja).
# Zahtijeva SUDREG_WRITE_API_KEY u okruženju.
URL="https://registar-poslovnih-subjekata.onrender.com/api/sudreg_expected_counts"
KEY="${SUDREG_WRITE_API_KEY:?Set SUDREG_WRITE_API_KEY in Render Cron Job Environment}"
wget -q -O- --post-data="" --header="X-API-Key: $KEY" "$URL"
