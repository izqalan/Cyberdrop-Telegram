
/**	Creates a callback that proxies node callback style arguments to an Express Response object.
 *	@param {express.Response} res	Express HTTP Response
 *	@param {number} [status=200]	Status code to send on success
 *
 *	@example
 *		list(req, res) {
 *			collection.find({}, toRes(res));
 *		}
 */

 
import Xray from 'x-ray';
import download from 'download';

let xray = Xray();

export function toRes(res, status=200) {
	return (err, thing) => {
		if (err) return res.status(500).send(err);

		if (thing && typeof thing.toObject==='function') {
			thing = thing.toObject();
		}
		res.status(status).json(thing);
	};
}

export function validURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '(((cyberdrop*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}

export function extractLink(url) {
  try {
    return xray(url, 'a.image', [{
      media: '@href'
    }]);
  } catch (error) {
    throw Error('Cannot find image');
  }
}

export async function downloadAlbum(links){
	// 14.64s | 10.9 MB @  110Mbps
	let media = [];
  for (const i in links){
    await download(links[i].media).then((image) => {
			media.push(image);
		});
	}
	return media;
}

export function getTitle(url){
  try {
    return xray(url, 'div.level-item h1', '@title');
  } catch (error) {
    throw Error('Cannot find title');
  }
}
