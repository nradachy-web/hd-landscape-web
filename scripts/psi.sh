#!/bin/zsh
# Real Google PageSpeed run with Nick's OAuth token from the Keychain. Never prints secrets.
# usage: scripts/psi.sh <url> <mobile|desktop>
set -u
url=$1; strat=$2
dir=${PSI_DIR:-/private/tmp/claude-501/-Users-modernapex/41773fcd-2a08-4f52-89a1-bf1ec0223caa/scratchpad/psi}
mkdir -p $dir; tokfile=$dir/.token
if [[ ! -s $tokfile || $(( $(date +%s) - $(stat -f %m $tokfile) )) -gt 3000 ]]; then
  cid=$(security find-generic-password -s apex-memory -a google_oauth_client_id -w)
  csec=$(security find-generic-password -s apex-memory -a google_oauth_client_secret -w)
  rt=$(security find-generic-password -s apex-memory -a gmail_refresh_token_nick -w)
  curl -s https://oauth2.googleapis.com/token -d client_id="$cid" -d client_secret="$csec" -d refresh_token="$rt" -d grant_type=refresh_token \
    | python3 -c 'import sys,json; print(json.load(sys.stdin)["access_token"])' > $tokfile.tmp && mv $tokfile.tmp $tokfile
  chmod 600 $tokfile
fi
tok=$(cat $tokfile)
enc=$(python3 -c 'import sys,urllib.parse; print(urllib.parse.quote(sys.argv[1], safe=""))' "$url")
out=$dir/run-$RANDOM-$strat.json
curl -s --max-time 180 -H "Authorization: Bearer $tok" "https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed?url=$enc&strategy=$strat&category=performance&category=accessibility&category=best-practices&category=seo" -o $out
python3 - "$out" "$url" "$strat" <<'PY'
import json,sys
p,url,strat=sys.argv[1:4]
d=json.load(open(p))
if 'error' in d:
    print(strat,'ERROR',d['error'].get('message','')[:160],url); sys.exit()
lr=d['lighthouseResult']; c=lr['categories']; a=lr['audits']
s=lambda k: round(c[k]['score']*100)
print(f"{strat:7s} P{s('performance')} A{s('accessibility')} BP{s('best-practices')} SEO{s('seo')} FCP {a['first-contentful-paint']['displayValue']} LCP {a['largest-contentful-paint']['displayValue']} SI {a['speed-index']['displayValue']} TBT {a['total-blocking-time']['displayValue']} CLS {a['cumulative-layout-shift']['displayValue']} {url.split('.io')[-1].split('.com')[-1]}")
PY
