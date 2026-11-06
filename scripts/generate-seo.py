"""Regenerate canonical tags, sharing metadata, structured data, and sitemap."""
from pathlib import Path
from html import escape, unescape
from urllib.parse import urljoin
from datetime import datetime
import json, re
ROOT=Path(__file__).resolve().parent.parent
ORIGIN='https://www.social-gear.com/'
EXCLUDE={'joined.html','hero-video-preview.html'}
REDIRECTS={'index.previous.html':'', 'examples.html':'case-studies.html','examples/manufacturing-radar.html':'case-studies/manufacturing-radar.html'}
DESCRIPTIONS={
'services.html':'AI strategy, workflow implementation, team training, and ongoing support for small businesses. Find the right starting point with Social Gear AI.',
'approach.html':'See how Social Gear AI maps recurring work, selects a focused pilot, and builds practical workflows with clear access and human approval boundaries.',
'pricing.html':'Explore Social Gear AI pricing: a free individual work map, a US$1,500 team assessment, and ongoing AI Sherpa support from US$4,500 per month.',
'contact.html':'Tell Social Gear AI about a recurring task or business bottleneck. Prepare a brief for a conversation about practical AI implementation.',
'book.html':'Book a conversation with Social Gear AI about your team’s workflow, AI implementation, or ongoing support needs.',
'case-studies.html':'Explore Social Gear AI workflow examples for inbox insights, manufacturing research, and zoning information. See the approach behind each project.',
 'trust.html':'Review Social Gear AI data handling, access boundaries, approval steps, and security considerations before connecting business tools.'}
def clean(s):return unescape(re.sub('<[^>]+>',' ',s)).strip()
urls=[]
for p in sorted(ROOT.rglob('*.html')):
 rel=p.relative_to(ROOT).as_posix()
 if any(x.startswith('.') for x in p.relative_to(ROOT).parts):continue
 s=p.read_text()
 # Replace only metadata owned by this generator.
 s=re.sub(r'\n?<!-- SEO:START -->.*?<!-- SEO:END -->\n?','',s,flags=re.S)
 s=re.sub(r'<link\b(?=[^>]*rel=["\']canonical["\'])[^>]*>','',s,flags=re.I)
 if rel in DESCRIPTIONS:s=re.sub(r'<meta name="description" content="[^"]*">',f'<meta name="description" content="{escape(DESCRIPTIONS[rel],quote=True)}">',s)
 canonical=ORIGIN+('' if rel=='index.html' else REDIRECTS.get(rel,rel))
 title=clean(re.search(r'<title>(.*?)</title>',s,re.S).group(1))
 dm=re.search(r'<meta name="description" content="([^"]*)"',s);description=unescape(dm.group(1)) if dm else title
 isblog=rel.startswith('blog/')
 block=f'\n<!-- SEO:START -->\n<link rel="canonical" href="{canonical}">\n'
 if rel in EXCLUDE:block+='<meta name="robots" content="noindex, follow">\n'
 elif rel not in REDIRECTS:
  urls.append(canonical)
  block+='<meta name="robots" content="index, follow, max-image-preview:large">\n'
  for prop,value in [('og:type','article' if isblog else 'website'),('og:site_name','Social Gear AI'),('og:title',title),('og:description',description),('og:url',canonical)]:block+=f'<meta property="{prop}" content="{escape(value,quote=True)}">\n'
  block+='<meta name="twitter:card" content="summary">\n'
  schema={'@context':'https://schema.org','@type':'WebPage','name':title,'description':description,'url':canonical}
  if isblog:
   schema.update({'@type':'BlogPosting','headline':clean(re.search(r'<h1[^>]*>(.*?)</h1>',s,re.S).group(1)), 'mainEntityOfPage':canonical,'publisher':{'@type':'Organization','name':'Social Gear AI','url':ORIGIN}})
   date=re.search(r'<p class="article-meta">([^<]+)</p>',s)
   if date:
    try:schema['datePublished']=datetime.strptime(date.group(1).strip(),'%B %d, %Y').strftime('%Y-%m-%d')
    except ValueError:pass
  elif rel=='blog.html':schema['@type']='CollectionPage'
  block+='<script type="application/ld+json">'+json.dumps(schema,ensure_ascii=False).replace('</','<\\/')+'</script>\n'
 block+='<!-- SEO:END -->\n'
 s=s.replace('</head>',block+'</head>')
 # Prefer the actual root canonical for homepage navigation.
 s=re.sub(r'href="(?:\.\./)?index.html"','href="/"',s)
 p.write_text(s)
xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join(f'  <url><loc>{escape(url)}</loc></url>\n' for url in urls)+'</urlset>\n'
(ROOT/'sitemap.xml').write_text(xml)
(ROOT/'robots.txt').write_text('User-agent: *\nAllow: /\n\nSitemap: '+ORIGIN+'sitemap.xml\n')
print(f'Generated canonical metadata and sitemap for {len(urls)} indexable pages.')
