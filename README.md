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