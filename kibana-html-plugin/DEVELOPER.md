# Dev
Install dependencies, clear plugin cache, redeploy and restart

```bash
cd ~/tmp/kibana-html-plugin
bower install

cd kibana
rm -rf ./optimize/*
cp -R ~/tmp/kibana-html-plugin ./src/plugins/
bin/kibana
```

# Release

```bash
tar -czf kibana-html-plugin-v0.0.x.tar.gz --exclude .git --exclude .idea --exclude *.iml --exclude src-noconflict --exclude src --exclude src-min --exclude demo kibana-html-plugin
```

## Debug scope

1. Open Firebug
2. Select HTML
3. Enter `angular.element($0).scope()` in console