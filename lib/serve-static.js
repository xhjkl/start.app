//
// Pipe contents of a binary file to a writable stream
//

import fs from 'fs';
import path from 'path';

import purifyPath from './purify-path';
import guessContentType from './guess-content-type';

// Serve static url
//
//  file -- requested locator, possibly unsafe
//  base -- a directory to never step outside of
//  response -- where to pipe to
//
export default function serveStatic({ file, base }, response) {

  return new Promise((resolve, reject) => {
    let localPath = path.resolve(base, purifyPath(file));
    let stream = fs.createReadStream(localPath);
    stream.on('end', () => {
      resolve();
    });
    stream.on('error', (error) => {
      reject(error);
    });

    response.setHeader('Content-type', guessContentType(localPath));
    stream.pipe(response);
  });
};
