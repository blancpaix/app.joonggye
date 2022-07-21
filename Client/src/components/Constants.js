export const RGX_BLANK = /\s/g;
export const RGX_DISPLAYNAME = /[a-zA-Z가-힣ㄱ-ㅎ]{2,15}/;
export const RGX_PHONENUMBER = /^\d{11}$/;
export const RGX_INT = /^[0-9]/g;

export const ProfileUrlMaker = (photoURL) => {
  if (!photoURL) return;
  return 'https://firebasestorage.googleapis.com/v0/b/jg-firebase-v2.appspot.com/o/thn128%2F'
    + photoURL.replace('+', '%2B')
    + '?alt=media';
};

export const ImageUrlMaker = (imgSrc) => {
  if (!imgSrc) return;
  return 'https://firebasestorage.googleapis.com/v0/b/jg-firebase-v2.appspot.com/o/program%2F'
    + imgSrc.replace('+', '%2B')
    + '?alt=media';
};

export const TermPathMaker = (gistsPath) => {
  if (!gistsPath) return;
  return 'https://gist.githubusercontent.com/chirpyVirus/' + gistsPath + '/terms.txt';
};

export const broadcastorImgSelector = (broadcastor) => {
  switch (broadcastor) {
    case 'SBS':
      return require('../images/broadLogo/SBS.png');
    case 'KBS1':
      return require('../images/broadLogo/KBS1.png');
    case 'KBS2':
      return require('../images/broadLogo/KBS2.png');
    case 'EBS1':
      return require('../images/broadLogo/EBS1.png');
    case 'EBS2':
      return require('../images/broadLogo/EBS2.png');
    case 'MBC':
      return require('../images/broadLogo/MBC.png');
    case 'JTBC':
      return require('../images/broadLogo/JTBC.png');
    case 'TV조선':
      return require('../images/broadLogo/TV조선.png');
    case 'MBN':
      return require('../images/broadLogo/MBN.png');
    case '채널A':
      return require('../images/broadLogo/채널A.png');
    default:
      return require('../images/broadLogo/default.png')
  }
};

export const noticeTypeMaker = (type) => {
  switch (type) {
    case 'notice':
      return '공지';
    case 'patch':
      return '패치';
    default:
      return '기타';
  }
}