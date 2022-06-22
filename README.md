# dynastart
Selfcontained startpage with dynamic search features

Designed to run from local directory, batteries included for air gapped environments.

Edit dynacontent.js to add new sites

Add entries yaml formatted like

```yaml
- name: loadbalancer frontend
  url: /
  tags:
    - infra
```


Yaml is loaded and converted to entries and nav menu items based on tags.


Remarks
- To many tags will add to many menu items. (no overflow yet)
- No syntax check on the input file

Todo:
Mention sources
- Jquery
- Bootstrap
- free snippet for styled <li> elements from bootsnipp.com

- Rework list to cards:
The <li> is a starting point for a box/card layout.
Would be nice to see how this works out.

- Support endless nrof tags
  maybe a tag carrousel?

  <prev> TAGNAME <next>

  