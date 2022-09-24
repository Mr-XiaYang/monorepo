const packageConfig = require("../package.json");
const esbuild = require('esbuild')
const path = require("path");

const internalPackage = {
  "@xy/server": path.join(__dirname, "../../core/server/src/server.ts")
};

esbuild.build({
  absWorkingDir: path.join(__dirname, ".."),
  entryPoints: ['./src/index.jsx'],
  outdir: 'dist',
  assetNames: "assets/[ext]/[name].[hash]",
  chunkNames: "chunks/[ext]/[name].[hash]",
  bundle: true,
  minify: false,
  metafile: true,
  incremental: true,
  sourcemap: true,
  sourcesContent: true,
  legalComments: "linked",
  platform: "node",
  format: "esm",
  target: ['node16', 'node18'],
  mainFields: ['module', 'main'],
  define: {
    "process.env.NODE_ENV": "\"development\""
  },
  external: []
    .concat(...Object.keys(packageConfig.dependencies))
    .concat(...Object.keys(packageConfig.peerDependencies))
    .filter((pkg) => ![...Object.keys(internalPackage)].includes(pkg))
    .reduce((external, pkg) => ([...external, pkg, `${pkg}/*`]), []),
  plugins: [{
    name: "alias", setup(build) {
      Object.entries(internalPackage).forEach(([pkg, pkgPath]) => {
        build.onResolve({filter: new RegExp(`^${pkg}$`)}, ({path}) => {
          return {path: pkgPath}
        })
      })
    }
  }, {
    name: "run", setup(build) {
      build.onEnd((result)=> {
        console.log(result);
      })
    }
  }],
  watch: {
    onRebuild(error, result) {
      if (error) {
        console.error("watch build failed:", error)
      } else {
        console.info("watch build succeeded")
        if (result.metafile) {
          console.log(esbuild.analyzeMetafileSync(result.metafile));
        }
      }
    }
  }
}).then((result) => {
  console.log('watching model start.')
}).catch(error => {
  console.error(error)
  process.exit(1);
})
