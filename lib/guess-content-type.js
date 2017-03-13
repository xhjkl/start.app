//
// Match filename extensions to their content type
//

import path from 'path';

// Return best match for content-type header
// given a filename with an extension
//
export default function guessContentType(filename) {
  const extmap = {
    'html': 'text/html; encoding=utf-8',
    'css': 'text/css',
    'js': 'application/javascript'
  };
  let ext = path.extname(filename).substr(1);
  let contentType = extmap[ext];
  if (contentType == null) {
    contentType = 'application/octet-stream';
  }

  return contentType;
};
