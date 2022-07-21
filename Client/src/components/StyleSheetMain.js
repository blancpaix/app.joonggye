import { Dimensions, StyleSheet } from "react-native";

export const width = Dimensions.get('window').width;
export const height = Dimensions.get('window').height;
export const ITEM_SIZE = width * 0.72;
export const ITEM_SPACER = (width - ITEM_SIZE) / 2;
export const SPACEING = 10;

export const fadeInBottom = {
  0: {
    opacity: 0,
    translateY: 100
  },
  1: {
    opacity: 1,
    translateY: 0
  }
};

export const layouts = StyleSheet.create({
  header: {
    height: 45,
    padding: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fdfdfd',
    borderBottomWidth: 0.75,
    borderColor: 'grey'
  },
  subTitleHeader: {
    flexDirection: 'row',
    backgroundColor: '#eeeeee',
    height: 36,
    paddingVertical: 3,
    paddingHorizontal: 12,
    alignItems: 'center',

  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
  },
  flexContent: {
    flex: 1,
    marginBottom: 50,
  },
  flexContentPadding9: {
    flex: 1,
    padding: 9,
  },
  flexRow: {
    flexDirection: 'row'
  },

  contentList: {
    borderWidth: 1.2,
    borderRadius: 15,
    borderBottomWidth: 2.7,
    borderColor: '#aaaaaa',
    padding: 6,
    marginBottom: 9,
  },
  disabledContentList: {
    borderWidth: 1.2,
    borderRadius: 15,
    borderBottomWidth: 2.7,
    borderColor: '#aaaaaa',
    padding: 6,
    marginBottom: 9,
    backgroundColor: '#d2d2d2'
  },
  contentListBgWhite: {
    borderWidth: 1.2,
    borderRadius: 15,
    borderBottomWidth: 2.7,
    borderColor: '#aaaaaa',
    padding: 6,
    marginBottom: 9,

    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
  },
  listBox: {
    margin: 9,
    marginBottom: 65,
    paddingHorizontal: 9, paddingVertical: 9,
    backgroundColor: 'white',
    borderRadius: 21,
    minHeight: 240,
  },
  listBoxNoneHeight: {
    margin: 9,
    paddingHorizontal: 9, paddingVertical: 9,
    backgroundColor: 'white',
    borderRadius: 21,
  },

  mdBottomRadius: {
    backgroundColor: '#f2f2f2',
    borderBottomLeftRadius: 21,
    borderBottomRightRadius: 21,
  },

  senderBox: {
    minHeight: 50,
    paddingHorizontal: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.75,
    borderColor: 'grey',
    padding: 6,
  },

});

export const inputs = StyleSheet.create({
  iconContainer: {
    marginBottom: -3
  },
  inputStyle: {
    paddingHorizontal: 9,
    paddingBottom: -9,
    fontSize: 18,
  },
  containerStyle: {
    marginTop: -6,
  },

  backgroundInputContainer: {
    backgroundColor: '#eeeeee',
    borderRadius: 18,
    height: 42,
    paddingLeft: 12,
    borderBottomWidth: 0,
  },
  error: {
    color: 'tomato',
    marginVertical: 1.2,
    paddingBottom: 6,
    paddingHorizontal: 9
  },
});

export const overlays = StyleSheet.create({
  centerOverlay: {
    borderRadius: 18,
    justifyContent: 'center',
    maxWidth: '72%',
    alignItems: 'center',
  },
  termsOverlay: {
    borderRadius: 18,
    width: '84%',
    height: '95%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomOverlay: {
    position: 'absolute',
    borderRadius: 18,
    bottom: 9,
    width: '93%',
    justifyContent: 'space-between',
  },
  pressButtonContainer: {
    flex: 1,
    marginHorizontal: 3,
  },
  pressButton: {
    backgroundColor: 'tomato',
    borderRadius: 9
  },
  pressButtonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export const buttons = StyleSheet.create({
  stretch: {
    backgroundColor: 'tomato',
    borderRadius: 9,
    height: 42,
  },

  xlEllipse: {
    borderRadius: 27,
    height: 54,
    width: 216,
    backgroundColor: 'tomato',
  },
  xlRoundButton: {
    backgroundColor: 'white', borderRadius: 24,
  },
  xlRoundContainer: {
    width: 48, height: 48, borderRadius: 24,
    position: 'absolute', right: 24, bottom: 45,
    elevation: 9, zIndex: 9
  },
  xlRound: {
    width: 42, height: 42,
    borderRadius: 42,
    position: 'absolute'
  },
  xlText: {
    fontSize: 21,
    fontWeight: 'bold',
    textAlignVertical: 'center',
    textAlign: 'center',
  },

  mdEllipse: {
    borderRadius: 21,
    backgroundColor: '#e2e2e2',
    height: 36,
  },
  mdRound: {
    backgroundColor: '#eeeeee',
    height: 36, width: 36, borderRadius: 18,
    elevation: 10,
  },
  mdText: {
    textAlignVertical: 'center',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    paddingHorizontal: 24,
  },

  smEllipse: {
    borderRadius: 18,
    backgroundColor: '#e2e2e2',
    height: 33,
    flexDirection: 'row',
    paddingHorizontal: 9,
    alignItems: 'center',
  },
  smRound: {
    backgroundColor: '#eeeeee',
    height: 33, width: 33, borderRadius: 17,
    elevation: 10,
  },
  smText: {
    textAlignVertical: 'center',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    paddingHorizontal: 24,
  },


  // 이거 xlRound 로 변경
  lgRound: {
    backgroundColor: '#eeeeee',
    height: 42, width: 42, borderRadius: 21,
    elevation: 10,
  },
});

export const icons = StyleSheet.create({
  avatarOverlayContainer: {
    backgroundColor: '#d2d2d2',
    elevation: 6,
  },
  limitText: {
    marginRight: 0,
    textAlignVertical: 'center',
    textAlign: 'center',
    backgroundColor: 'yellow',
    borderRadius: 24,
    borderColor: 'black',
    borderWidth: 2,
    width: 27,
    height: 27,
    fontWeight: 'bold',
    fontSize: 14,
    color: 'black',
  },
  infoIconText: {
    alignSelf: 'center',
    // alignContent: 'center',

    marginHorizontal: 3,
    paddingVertical: 2,
    paddingHorizontal: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'grey',
    color: 'grey',
    fontSize: 10,
    fontWeight: 'bold',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
  expBox: {
    flexDirection: 'row',
    padding: 4.5,
    borderRadius: 9,
    backgroundColor: '#d2d2d2',
  },
  expTimeBox: {
    borderRadius: 6, backgroundColor: 'white', paddingHorizontal: 9,
  },
});

export const texts = StyleSheet.create({
  broadcastorBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 9,
    paddingHorizontal: 12,
  },
  exlCenter: {
    fontSize: 24,
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingVertical: 9,
  },
  xlBoldCenter: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlignVertical: 'center',
    textAlign: 'center',
    color: 'black',
  },
  lgBoldCenter: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlignVertical: 'center',
    textAlign: 'center',
    color: 'black',
  },
  lgBold: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlignVertical: 'center',
    color: 'black',
  },
  lgCenter: {
    fontSize: 18,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: 'black',
  },
  lg: {
    fontSize: 18,
    textAlignVertical: 'center',
    color: 'black',
  },
  mdBoldCenter: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlignVertical: 'center',
    textAlign: 'center',
    color: 'black',
  },
  mdBoldRight: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlignVertical: 'center',
    textAlign: 'right',
  },
  mdBold: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlignVertical: 'center',
    color: 'black',
  },

  mdCenter: {
    fontSize: 15,
    textAlignVertical: 'center',
    textAlign: 'center',
    color: 'black',
  },
  md: {
    fontSize: 15,
    textAlignVertical: 'center',
    color: 'black',
  },
  smBoldCenter: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlignVertical: 'center',
    textAlign: 'center',
    color: 'black',
  },
  smBold: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlignVertical: 'center',
    color: 'black',
  },
  sm: {
    fontSize: 12,
    textAlignVertical: 'center',
    color: 'black',
  },
  animateText: {
    fontWeight: 'bold',
    marginTop: 10,
  },

  lgBoldLeft: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlignVertical: 'center',
    color: 'black',
  },
  mdBoldLeft: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlignVertical: 'center',
    textAlign: 'left',
    color: 'black',
  },
  smBoldLeft: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlignVertical: 'center',
    color: 'black',
  },

  bgGreyPadder: {
    backgroundColor: '#eeeeee',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 9,
  },

  mdShadow: {
    textShadowColor: 'grey',
    textShadowOffset: { width: 2.4, header: 5 },
    textShadowRadius: 2.7,
  }
});

export const tables = StyleSheet.create({
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    borderBottomColor: 'grey',
    borderBottomWidth: 1.5,
  },
  listContainer: {
    flexDirection: 'row',
    borderRadius: 9,
    borderTopWidth: 1,
    borderTopColor: '#d2d2d2',
    paddingVertical: 12,
  },
  loadIcon: {
    alignSelf: 'center', backgroundColor: 'red', paddingVertical: 3
  },
  loadEmpty: {
    paddingVertical: 9,
  }
});

export const msgs = StyleSheet.create({
  displayName: {
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 3,
    paddingLeft: 4,
    color: 'grey',
  },
  systemText: {
    backgroundColor: '#d2d2d2',
    fontSize: 12,
    textAlign: 'center',
    alignSelf: 'center',
    width: '60%',
    paddingVertical: 0.9,
    marginVertical: 3,
    borderRadius: 9,
  },
  mineBox: {
    marginLeft: '18%',
    marginTop: 2,
    marginBottom: 4,
    flexDirection: 'row',
    alignSelf: 'flex-end',
  },
  mineText: {
    color: 'white', fontSize: 15,
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: 'tomato', borderRadius: 12,
    marginRight: 6,
    textAlignVertical: 'center',
  },
  mineBubble: {
    width: 24, borderBottomColor: 'tomato', borderBottomWidth: 21,
    borderRightWidth: 15, borderRightColor: 'transparent',
    borderBottomLeftRadius: 30,
    position: 'absolute',
    right: 0, bottom: 0,
  },
  msgBox: {
    marginRight: '18%',
    marginTop: 2,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  msgDisplayName: {
    marginBottom: 3,
    fontSize: 13,
    marginLeft: 4,
    color: 'black'
  },
  msgText: {
    color: 'black', fontSize: 15,
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: '#d2d2d2', borderRadius: 12,
    marginLeft: 6,
    textAlignVertical: 'center',
  },
  msgBubble: {
    width: 24, borderTopColor: '#d2d2d2', borderTopWidth: 21,
    borderLeftWidth: 15, borderLeftColor: 'transparent',
    borderTopRightRadius: 30,
    position: 'absolute',
    left: 0, top: 0,
  },
  aggroBox: {
    borderColor: 'red', borderWidth: 1.8, borderRadius: 12,
    backgroundColor: 'white',
    alignSelf: 'center',
    minWidth: '42%', maxWidth: '87%',
    marginTop: 2, marginBottom: 4,
  },
  aggroDisplayName: {
    alignSelf: 'flex-start',
    backgroundColor: 'red',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 6,
    color: 'white',
    textAlignVertical: 'center',
    fontSize: 13, fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingBottom: 3,
  },
  aggroText: {
    fontSize: 15, fontWeight: 'bold',
    textAlignVertical: 'center', textAlign: 'center',
    paddingHorizontal: 12, paddingTop: 2, paddingBottom: 4,
  },
});

export const aggros = StyleSheet.create({
  aggroBox: {
    marginVertical: 6,
    padding: 6,
    borderWidth: 1.8,
    borderBottomWidth: 2.4,
    borderRadius: 15,
    borderColor: 'red',
    backgroundColor: 'rgba(255,255, 255, 0.97)',
    alignSelf: 'center',
    minWidth: '66%',
    maxWidth: '87%',
    elevation: 18,
    zIndex: 18,
    maxHeight: 192,
  },
})

export const lotties = StyleSheet.create({
  default: {
    width: 240,
    height: 240,
    alignSelf: 'center',
  },
  alignCenter: {
    alignItems: 'center',
  },
  lottieBox: {
    alignItems: 'center',
    marginBottom: 30,
  },
  fontBold18: {
    fontSize: 18,
    marginVertical: 4,
    fontWeight: 'bold'
  },
  font18: {
    fontSize: 18,
    marginVertical: 4,
  },
  fontBold21: {
    fontSize: 21,
    marginVertical: 4,
    fontWeight: 'bold'
  },
});

export const ads = StyleSheet.create({
  stretchBanner: {
    minHeight: 50, flex: 1,
    alignSelf: 'center',
  }
});
