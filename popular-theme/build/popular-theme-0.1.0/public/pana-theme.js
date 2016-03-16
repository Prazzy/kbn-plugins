/**
 * Created by praveen on 2/26/16.
 */

import chrome from 'ui/chrome';
import kibanaLogoUrl from 'plugins/popular-theme/images/panasky_logo_white.png';

chrome
.setBrand({
  'logo': 'url(' + kibanaLogoUrl + ') left no-repeat',
  'smallLogo': 'url(' + kibanaLogoUrl + ') left no-repeat'
})
.setNavBackground('#08519c');