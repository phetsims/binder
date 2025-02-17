/* eslint-disable */
/* @formatter:off */

import asyncLoader from '../../phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAA4CAYAAAAB8vOKAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3tJREFUeNq8mDFPIkEUxxd2xQDFUV4J0lyUgm9wQmVDMLE5Gw+JhgSLM1Z0XGNMTIxWUlIbigsfgNx9BI0WdwTDlV5nJAKiwL03cTaPcWYXYXdf8jI7m5357X/2zcyb1TSPLZVKJQ0vgel0OgJF1VPowsLCqd/v905pJpPJQZHTdV3zBLqxsZEcj8enDGgY7kM3NzcjAPzh8/kiDOgFFL4jAqOmSrehOzs7VShWEQhw96F7e3v7MKw5rtB16MHBQQ4DB6bHBNAEOw0slUoIrFIgd1eUlstlSyCWjs7Tw8PD7wAsI5DCRCBE8vzQo6Mjtp5CZ+s0SlXAuaDHx8cI2wf/Buoi0oB5vUb1COPlu6AnJydRnHfgn8HXESadEsRFIPvetNOzs7MkFJHXKpZY1+BbISSJSxlvyGETKw1xOpxvlFYqlfFoNMKOmVPDB9BoI+xMdArHUoTwa+5GKBTSrKBiI96pDEwhMpUmNBwOm1DRZFAK5y6DqNqhMaUylRQqe1uZKtn3E59lUFSqgqo65o1VQPEFaXwwaDAYlALFB0UQv5YNp3hfNAMDQGUidFqFKpgJXVxcVE4VUaEMKFNrZ0YgELBVKvuWoqJpYCbU7mHx7WldFYC2ULtGs3RqC316evL6OKMZg8HAe2iv15NGq6vQx8dHyyh14yWMbrdruwjw6eHUSLDhtVvyVAvBzNB+v29OC6s5abXsvRva6XQYVDWktGO7rWza4TceHh6m2rhpGqKCTzv0plLV5q1KUaw2cTs4i167dZeCefJF8yJVbqSCG8PhMHZ+fv6X3iwWi5jfRl+rmOd+wBIaJylYTDmtErOJoHxP1BUKBcx78SW+8mMETbR53U71zJNtd3cXR6IMneTenLSFZPsNfN7VJZ/Pr+KPDPE8Ix4rJobbibV0a2sLjyA/8ZvLzjaiat0J6NXVVT+RSFxAUK6BfwRnCTw9OaDze7pTO8f19XV/ZWXlAjpdA7cE605uWTc3N/3l5WUTTKEU7nd6r6zVavcASL28vFw+Pz9rmJngpoJpETrWXUsTstks/p5rY1SzMykJLr9b0Hq9zhXfgzOF3HXNRWs2m3fxePwPKP5Cg8lVKFqr1fq9tLTkA9gqBhOa61C029vbX7FYDP/5fmJHUK9yXVC5DX6J89czaKPRwMDaBui9rnlo7Xb7Dob5338BBgDVTovZeghrHgAAAABJRU5ErkJggg==';
export default image;