# Magick Without Tears 2.0

A digital correspondence series. Twenty-two AI-powered chatbots — the complete Major Arcana.

## The Twenty-Two

| File | Figure | Dates |
|------|--------|-------|
| anger.html | Kenneth Anger | 1927–2023 |
| bailey.html | Alice A. Bailey | 1880–1949 |
| blake.html | William Blake | 1757–1827 |
| blavatsky.html | H.P. Blavatsky | 1831–1891 |
| bruno.html | Giordano Bruno | 1548–1600 |
| burroughs.html | William S. Burroughs | 1914–1997 |
| cameron.html | Cameron | 1922–1995 |
| castaneda.html | Carlos Castaneda | 1925–1998 |
| crowley.html | Aleister Crowley | 1875–1947 |
| dee.html | Dr. John Dee | 1527–1608 |
| fortune.html | Dion Fortune | 1890–1946 |
| levi.html | Éliphas Lévi | 1810–1875 |
| sybil_leek.html | Sybil Leek | 1917–1982 |
| simon_magus.html | Simon Magus | 1st c. AD |
| parsons.html | Jack Parsons | 1914–1952 |
| gen_porridge.html | Genesis P-Orridge | 1950–2020 |
| rambova.html | Natacha Rambova | 1897–1966 |
| randolph.html | P.B. Randolph | 1825–1875 |
| smith.html | Pamela Colman Smith | 1878–1951 |
| spare.html | Austin Osman Spare | 1886–1956 |
| swedenborg.html | Emanuel Swedenborg | 1688–1772 |
| miss_cleo.html | Miss Cleo (bonus) | 1962–2016 |

## Deployment — Netlify

1. Push this folder to a GitHub repository
2. Connect to Netlify → Import existing project → Select repo
3. Site config → Environment variables → Add `ANTHROPIC_API_KEY` (your key starting sk-ant-...)
4. Trigger redeploy → Done

## Notes

- Conversations save automatically per entry (persistent storage)
- Works inside Claude.ai artifacts AND on Netlify deployment
- Each entry costs API tokens per message
