/* 
dynacontent`
- name: loadbalancer frontend
  url: /
  tags:
    - infra
`.trim()
*/
var dynacontent = ` ---
- name: loadbalancer frontend
  url: /
  tags:
    - infra
- name: vcenter 
  url: /
  tags:
    - infra
    - vmware
- name: Home assistant
  url: /
  tags:
    - infra
- name: Stackoverflow
  url: https://stackoverflow.com/
  tags:
    - coding
- name: pihole
  url: /
  tags:
    - dns
    - infra
- name: loadbalancer backend
  url: /
  tags:
    - infra
- name: GitHub
  url: https://github.com/
  tags:
    - code
- name: The Guardian
  url: https://www.theguardian.com/international
  tags:
    - news
- name: bbbootstrap
  url: https://bbbootstrap.com/
  tags:
    - code
- name: Hacker News
  url: https://news.ycombinator.com/
  tags:
    - news
    - tech
`.trim()