const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const tar = require('tar-stream');
const packer = tar.pack();
const compressor = packer.pipe(new zlib.Gzip());

fs.readdir('./dist/images/', (err, files) => {
  let filesToProcess = [];

  files.forEach(file => {
    filesToProcess.push(`dist/images/${file}`);
  });

  for (const name of filesToProcess) {
    const loc = path.join(__dirname, name);
    const stat = fs.lstatSync(loc);

    if (stat.isFile()) {
      let buffer = fs.readFileSync(loc, 'binary');

      const entry = {
        name: `package/${name}`,
        size: stat.size,
        mode: stat.mode,
        mtime: stat.mtime,
        type: 'file'
      };

      let result = packer.entry(entry, buffer, function (err) {
        if (err) {
          console.log(err);
        } else {
          //console.log('Success');
        }
      });
    }
  }

  packer.finalize();

  compressor.pipe(fs.createWriteStream('stand-alone.tgz'));
});