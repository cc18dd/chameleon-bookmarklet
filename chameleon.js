//--------------------------------------------//
//                  Chameleon                 //
//                 Color Picker               //
//--------------------------------------------//

///////////////////////////////////////////////////////////////////////////////////////////////////
//--------------------------------------------
//              General Utils
//--------------------------------------------

var ChameleonUtils = {

//-----------------------------------------------------
getPos : function(o) {
var pos = {};
var leftX = 0;
var leftY = 0;
if(o.offsetParent) {
	while(o.offsetParent) {
		leftX += o.offsetLeft;
		leftY += o.offsetTop;
		o = o.offsetParent;
	}
} else if(o.x) {
	leftX += o.x;
	leftY += o.y;
}
pos.x = leftX;
pos.y = leftY;
return pos;
},

//-----------------------------------------------------
// move a abs positioned element to an x y location
moveElem : function(o, x, y) {
o=o.style;
o.left=x + 'px';
o.top=y + 'px';
},

//-----------------------------------------------------
getWindowDimensions : function () {
var out = {};
if (window.pageXOffset) {
	out.scrollX = window.pageXOffset;
	out.scrollY = window.pageYOffset;
} else if (document.documentElement) {
	out.scrollX = document.body.scrollLeft + document.documentElement.scrollLeft; 
	out.scrollY = document.body.scrollTop + document.documentElement.scrollTop;
} else if (document.body.scrollLeft >= 0) {
	out.scrollX = document.body.scrollLeft;
	out.scrollY = document.body.scrollTop;
}

if (document.compatMode == "BackCompat") {
  out.width = document.body.clientWidth;
	out.height = document.body.clientHeight;
} else {
	out.width = document.documentElement.clientWidth;
	out.height = document.documentElement.clientHeight;
}
return out;
},

//-------------------------------------------------
getElementFromEvent : function (evt) {
if (!evt)
	evt = window.event;
return ((evt.target) ? evt.target : evt.srcElement);
},

//-------------------------------------------------
getMousePosFromEvent : function (evt) {
if (!evt)
	evt = window.event;
var pos = {};
if (evt.pageX) 	{
  pos.x = evt.pageX;
  pos.y = evt.pageY;
}
else if (evt.clientX) 	{
  pos.x = evt.clientX + document.body.scrollLeft
    + document.documentElement.scrollLeft;
  pos.y = evt.clientY + document.body.scrollTop
    + document.documentElement.scrollTop;
}
return pos;
},

//-------------------------------------------------
removeListener : function (element, eventType, handler, capture) {
if (element.removeEventListener) {
	element.removeEventListener(eventType, handler, capture);
	return true;
}
else if(element.detachEvent)
	return element.detachEvent('on' + eventType, handler);
else
	element["on" + eventType] = null;
},

//------------------------------------------------------
modifyClassName : function (elem, add, string) {
var s = (elem.className) ? elem.className : "";
if (add)
	s += " " + string;
else {
  var a = s.split(" ");
  s = "";
  for (var i=0; i<a.length; i++)
    if (a[i] != string)
      s += a[i] + " "; 
}
elem.className = s;
},

//------------------------------------------------------
createElement : function(a) {
var i = 2, j, s, p, c;
var elem = a[0];

if (typeof(elem)=="string") {
  elem = document.createElement(elem);
}
 
if ((c = a[1]) != null) {
  if (c.length || c.html || c.tagName) {
    i = 1;
  }
  else {
    s = c.style;
    if (s)
      for (j in s)
        elem.style[j] = s[j];
    for (j in c) {
      p = c[j];
    if (p != s)
      elem[j] = p;
    }
    c = a[2];
  }
  while (i<a.length) {
    if (typeof(c) == "object") {
      if (c.length) {
        var t = c;
        c = ChameleonUtils.createElement(c);
        t[0] = c;
      } else if (c.html) {
        var d = document.createElement ("div");
        d.innerHTML = c.html;
        var arr = [], j, len = d.childNodes.length;
        for (j=len-1; j >= 0; j--)
          arr[j] = d.removeChild(d.childNodes[j]);
        for (j=0; j < len; j++)
          elem.appendChild(arr[j]);
        i++;
        c = a[i];
        continue;
      }
      // else: already dom element
    } else
      c = document.createTextNode(c);
    elem.appendChild(c);
    i++;
    c = a[i];
  }
}
return elem;
},

//------------------------------------------------------
createDomElems : function(array, innerElems) {
var e = ChameleonUtils.createElement (array);
for (var i in innerElems)
 if (innerElems[i][0])
  innerElems[i] = innerElems[i][0];
return e;
},

addMembers : function (to, from) {
for (var i in from)
    to[i] = from[i];
},


createElementOld : function(elem,properties) {
var i, s, p, c;
if (typeof(elem)=="string")
	elem = document.createElement(elem);
if (properties) {
	s = properties.style;
	if (s)
		for (i in s)
			elem.style[i] = s[i];
	for (i in properties) {
		p = properties[i];
		if (p != s)
			elem[i] = p;
		}
	}
for (i=2; i<arguments.length; i++) {
	c = arguments[i];
	if (typeof(c) == "string")
		c = document.createTextNode(c);
	elem.appendChild(c);
	}
	

return elem;
},


//prevents IE memory leak, nulls all functions attached to a dom element and its children
purgeChameleonEventHandlers : function (elem) {
var a, i, l,
    events = ["onmouseover", "onmouseout", "onclick", "onmousedown", "onmouseup", "onmousemove", "onkeyup", "onkeydown", "onkeypress"];
if (elem.mouseEventHandler || elem.aaEvtHandler) {
  elem.mouseEventHandler = null;
  elem.aaEvtHandler = null;
  l = events.length;
  for (i=0; i<l; i++)
    elem[events[i]] = null;
}
a = elem.childNodes;
if (a) {
  l = a.length;
  for (i = 0; i < l; i++) {
    ChameleonUtils.purgeChameleonEventHandlers(elem.childNodes[i]);
  }
}
},

//------------------------------------------------
// callbacks can be an array, with members as follows:
//
// 0: function pointer
// 1: arguments (array or single object/variable)
// 2: "this" object (may be null)
// 3: forced return value (null to return whatever callback returns)
// 4: true to force it to pass an array (item 1) as a single object
//    rather than individual parameters
//
// this function can have additional arguments, which will be passed
// to the callback *after* the user argument(s).  If you need to send
// a variable number of user args (i.e. some are optional), best to 
// pass them packed into a single object

doCallback : function (callback) {
var ret;
try {
  if (callback.length != null) { // is it an array?
    // is "user args" an array (that should be passed as individual args)
    if (callback[1] != null && callback[1].length && callback[4] == null) {
      if (arguments.length > 1)  { // additional api args
        var i, a = [];
        // user args
        for (i=0; i < callback[1].length; i++)
          a.push(callback[1][i]);
        // api args
        for (var i=1; i < arguments.length; i++)
          a.push(arguments[i]);
        ret = callback[0].apply (callback[2], a);
      }
      else // no api args
        ret = callback[0].apply (callback[2], callback[1]);
    } else { // "user args" is a single object/variable
      if (arguments.length > 1)  { // additional api args
        var i, a = [];
        // user arg
        a.push(callback[1]);
        // api args
        for (var i=1; i < arguments.length; i++)
          a.push(arguments[i]);
        ret = callback[0].apply (callback[2], a);
      }
      else // no api args
        ret = callback[0].call (callback[2], callback[1]);
    }
    if (callback[3] != null) // forced return value
      return callback[3];
    }
  else { // callback just a function
    ret = callback ();
    }
} catch (e) {
  //alert("callback error (" + e + "): " +
    //    ChameleonUtils.objectToString(callback, 0),8);
  return;
}
return ret;
},

makeUnitVector : function (p1, p2) {
var uv = ChameleonUtils.makeVector(p1, p2),
    mag = ChameleonUtils.getMagnitude(uv);
uv.x /= mag;
uv.y /= mag;
return uv;
},

makeVector : function (p1, p2) {
var v = {};
v.x = p1.x - p2.x;
v.y = p1.y - p2.y;
return v;
},

dotProduct : function (v1, v2) {
return (v1.x*v2.x) + (v1.y*v2.y);
},

projectPoint : function (p, uv, d) {
var pp = {};
pp.x = (uv.x*d) + p.x;
pp.y = (uv.y*d) + p.y;
return pp;
},

getDistance : function (p1, p2) {
return Math.sqrt(((p2.x-p1.x)*(p2.x-p1.x)) + ((p2.y-p1.y)*(p2.y-p1.y)));
},

getMagnitude : function (v) {
return Math.sqrt((v.x*v.x)+(v.y*v.y));
},

//--------------------------------------------------
// interpolates/extrapolates values from a provided table, x values of map argument are expected to be in ascending order
getInterpolatedValue : function(x, map) {
	for (var i=0;i<map.length;i++) {
		if ((x<map[0][0])?(x<map[0][0]):(map[i][0]<=x && map[i+1][0]>x) || i==map.length-2) {
			return (map[i][1])+(((x-(map[i][0]))/((map[i+1][0])-(map[i][0])))*((map[i+1][1])-(map[i][1])));
		}
	}
},

//------------------------------------------------------
scrollWindowOneIncrement : function (elem, ss) {
var diff = ss.yTarget - ss.currY;
if (diff < ss.scrollSpeed)	{
	window.scrollTo (0, ss.currY + diff);
	if (ss.callback)
		ss.callback.apply (null, ss.callbackArgs);
	}
else {
	ss.currY += ss.scrollSpeed;
	window.scrollTo (0, ss.currY);
	ChameleonEventHandlers.setTimerFunction ([ChameleonUtils.scrollWindowOneIncrement, [elem, ss]], 20);
	}
},

//------------------------------------------------------
scrollWindowToElement : function (elem, callback, callbackArgs) {
var speed,
	dims = ChameleonUtils.getWindowDimensions(),
	ss = {dims: dims,
		currY: dims.scrollY,
		callback: callback,
		callbackArgs: callbackArgs},
	y = ChameleonUtils.getPos(elem).y, h = dims.height, bottomOfWindow = ss.currY + h, bottomOfElem = (y + elem.offsetHeight	+ 4), diff = bottomOfElem - bottomOfWindow;

if (diff <= 0) {
	if (ss.callback)
		ss.callback.apply (null, ss.callbackArgs);
	return;
	}
ss.yTarget = bottomOfElem - h;
ss.scrollSpeed = ChameleonUtils.getInterpolatedValue (diff, [[100, 20], [2000, 400], [3000, 800]]);
ChameleonUtils.scrollWindowOneIncrement (elem, ss);
},


/* not needed by color picker */
//--------------------------------------------------------------
// get an element within another by its tag type and its classname
// (or partial classname, for instance if the classname is "whatever"
// you can get it by "what" but not "ever")
getDecendantElem : function (container, type, classname) {
if (container != null) {
	var i, e, len, elems = container.getElementsByTagName(type); 
	len = elems.length; 
	for (i = 0; i < len; i++) 
		{
		e = elems.item(i);
		if (e.className && e.className.indexOf(classname)==0)
			return e;
		}
	}
return null;
},

//-------------------------------------------------
getCookie : function(name) {
if(name.length > 0 && document.cookie.length > 0) {
	var begin = document.cookie.indexOf(name+"="); 
	if(begin != -1) {
		begin += name.length+1; 
		var end = document.cookie.indexOf(";", begin);
		if(end == -1)
			end = document.cookie.length;
		return unescape(document.cookie.substring(begin, end));
		} 
	}
return null; 
},

//-------------------------------------------------
setCookie : function(cookieName, cookieValue, path, nDays) {
var today = new Date();
var expire = new Date();
expire.setTime(today.getTime() + 3600000*24*nDays);
document.cookie = cookieName + "=" + escape(cookieValue) +
	((path) ? "; path=" + path : "") +			
	";expires=" + expire.toGMTString();
},

//-------------------------------------------------
deleteCookie : function(name, path) {
K.setCookie(name, "", path, -1);
}

};


///////////////////////////////////////////////////////////////////////////////////////////////////

//--------------------------------------------
//             Event Handlers
//--------------------------------------------
var ChameleonEventHandlers = {
//-------------------------------------------
setMouseEventHandler : function(elem, callback, moreParams) {
elem.mouseEventHandler = {callback: callback};
elem.onmouseover = ChameleonEventHandlers.mouseChameleonEventHandlers.over;
elem.onmouseout = ChameleonEventHandlers.mouseChameleonEventHandlers.out;
if (moreParams && moreParams.blockSelect)
  elem.mouseEventHandler.blockSelect = true;
if (moreParams && moreParams.draggable)
  elem.onmousedown = ChameleonEventHandlers.mouseChameleonEventHandlers.startdrag;
else  {
  elem.onclick = ChameleonEventHandlers.mouseChameleonEventHandlers.click;
  elem.onmousedown = ChameleonEventHandlers.mouseChameleonEventHandlers.down;   
}
return elem;
},

mouseChameleonEventHandlers : {
dragElement : null,

click : function(evt) {
var o = this.mouseEventHandler;
return ChameleonUtils.doCallback (o.callback, "click", this, ((evt)?evt:window.event));
},

down : function(evt) {
var o = this.mouseEventHandler;
if (!evt)
  evt = window.event;
if (o.blockSelect) {
  if (document.all) {
    evt.returnValue = false;
    evt.cancelBubble = true;
  } else
    evt.preventDefault();
}
evt.returnValue = false;
evt.cancelBubble = true;
ChameleonUtils.doCallback (o.callback, "down", this, ((evt)?evt:window.event));
return false;
},

startdrag : function(evt) {
ChameleonEventHandlers.mouseChameleonEventHandlers.dragElement = this;
ChameleonEventHandlers.setListener (document, "mousemove", ChameleonEventHandlers.mouseChameleonEventHandlers.drag, true);
ChameleonEventHandlers.setListener (document, "mouseup", ChameleonEventHandlers.mouseChameleonEventHandlers.enddrag, true);
var o = this.mouseEventHandler;
if (!evt)
  evt = window.event;
if (o.blockSelect) {
  if (document.all) {
    evt.returnValue = false;
    evt.cancelBubble = true;
  } else
    evt.preventDefault();
} else {
  evt.returnValue = false;
  evt.cancelBubble = true;
}
return ChameleonUtils.doCallback (o.callback, "startdrag", this, evt);
},

drag : function(evt) {
var elem = ChameleonEventHandlers.mouseChameleonEventHandlers.dragElement;
var o = elem.mouseEventHandler;
if (!evt) {
  evt = window.event;
}
if (evt.preventDefault) {
  if (document.all) {
    evt.returnValue = false;
    evt.cancelBubble = true;
  } else
    evt.preventDefault();
} else {
  evt.returnValue = false;
  evt.cancelBubble = true;
}
return ChameleonUtils.doCallback (o.callback, "drag", elem, evt);
},

enddrag : function(evt) { 
var elem = ChameleonEventHandlers.mouseChameleonEventHandlers.dragElement;
var o = elem.mouseEventHandler;
ChameleonEventHandlers.cancelListener (document, "mousemove", ChameleonEventHandlers.mouseChameleonEventHandlers.drag);
ChameleonEventHandlers.cancelListener (document, "mouseup", ChameleonEventHandlers.mouseChameleonEventHandlers.enddrag);
if (o.queueOverOut)
  ChameleonUtils.doCallback (o.callback, (o.queueOverOut==1)?"over":"out", this, ((evt)?evt:window.event));
ChameleonEventHandlers.mouseChameleonEventHandlers.dragElement = null;
delete (ChameleonEventHandlers.mouseChameleonEventHandlers.dragElement);
return ChameleonUtils.doCallback (o.callback, "enddrag", elem, ((evt)?evt:window.event));
},

over : function(evt) {
var o = this.mouseEventHandler;
if (ChameleonEventHandlers.mouseChameleonEventHandlers.dragElement == this)
  o.queueOverOut = 1;
else {
  delete (o.queueOverOut);
  return ChameleonUtils.doCallback (o.callback, "over", this, ((evt)?evt:window.event));
}
},

out : function(evt) {
var o = this.mouseEventHandler;
if (ChameleonEventHandlers.mouseChameleonEventHandlers.dragElement == this)
  o.queueOverOut = 2;
else {
  delete (o.queueOverOut);
  return ChameleonUtils.doCallback (o.callback, "out", this, ((evt)?evt:window.event));
}
}
},

//-------------------------------------------
setEventHandler : function(elem, type, callback) {
if (!elem.aaEvtHandler)
	elem.aaEvtHandler = {};
elem.aaEvtHandler[type] = callback;
if (ChameleonEventHandlers[type])
	elem[type] = ChameleonEventHandlers[type];
else
	elem[type] = function(evt) {
		return ChameleonEventHandlers.genericEventHandler(elem, type, ((evt)?evt:window.event));
		};
return elem; // for chaining calls
},

genericEventHandler : function(elem, type, evt) {
var eh, c;
if ((eh = elem.aaEvtHandler) != null) {
  eh.event = evt;
  if ((c = eh[type]) != null) {
    var ret = ChameleonUtils.doCallback (c);
    delete eh.event;
    return ret;
  }
}
return false;
},

// having common ones declared here saves memory vs. using closures
onclick : function(evt) {
 return ChameleonEventHandlers.genericEventHandler(this, "onclick", ((evt)?evt:window.event));},
onkeypress : function(evt) {
 return ChameleonEventHandlers.genericEventHandler(this, "onkeypress", ((evt)?evt:window.event));},
onmouseover : function(evt) {
 return ChameleonEventHandlers.genericEventHandler(this, "onmouseover",((evt)?evt:window.event));},
onmouseout : function(evt) {
 return ChameleonEventHandlers.genericEventHandler(this, "onmouseout",((evt)?evt:window.event));},

setTimerFunction : function(callback, milliseconds) {
var id, au = ChameleonEventHandlers;
for (id=0; id < au.timeoutData.length; id++)	{
	if (au.timeoutData[id] == null) {
		break;
  }
}
var td = au.timeoutData[id] = {};
td.callback = callback;
td.handle = setTimeout ("ChameleonEventHandlers.callbackForSetTimeout(" + id + ")", milliseconds);
return id;
},

cancelTimerFunction : function(id) {
var a = ChameleonEventHandlers.timeoutData, td = a[id];
if (td) {
  clearTimeout (td.handle);
	if (id == a.length-1)
		a.pop();
	else
		delete a[id];
}
},

cancelTimerFunctionByFunction : function(func) {
var id, au = ChameleonEventHandlers;
for (id=0; id < au.timeoutData.length; id++) {
	if ((td = au.timeoutData[id]) != null && td.callback[0] == func)
		au.cancelTimerFunction (id);
}
},

callbackForSetTimeout : function(id) {
var	 a = ChameleonEventHandlers.timeoutData, td = a[id];
ChameleonUtils.doCallback (td.callback);
if (id == a.length-1)
	a.pop();
else
	delete a[id];
},

timeoutData : [],

//-------------------------------------------------
//cross-browser event handling with listeners(if available)
setListener : function(element, eventType, handler) {
if(window.addEventListener) {
	element.addEventListener(eventType, handler, false);
	return true;
} else if(window.attachEvent) {
	element.attachEvent('on' + eventType, handler);
	return true;
}
},

//-------------------------------------------------
cancelListener : function(element, eventType, handler) {
if(window.removeEventListener) {
	element.removeEventListener(eventType, handler, false);
	return true;
} else if(window.detachEvent) {
	element.detachEvent('on' + eventType, handler);
	return true;
}
}

};


///////////////////////////////////////////////////////////////////////////////////////////////////

//--------------------------------------------
//             Popup
//--------------------------------------------
var Popup = function
(
parentElement,
position,
parentHiliteClassname,
backgroundClassname,
isMenu
) {
var i, o, c, p, GU = ChameleonUtils, EH = ChameleonEventHandlers;
var st = Popup.stack;

if (!Popup.containerElem)
	Popup.containerElem = document.body;

// kill any existing popups, but....
// if the parent element is contained in an existing popup,
// do not kill that popup or any up the stack from it

FOUND_PARENT:
for(i=st.length-1; i>=0; i--) {
	c = st[i].element;
	o = parentElement;
	if(parentElement != null) {
		while(o != null) {
			// found one
			if(c == o) {
				//p(parentElement.innerHTML, true)
				break FOUND_PARENT;
			}
			o = o.parentNode;
		}
		p = st[i];
		if (!p.noKillByClick)
  			p.kill ();
	}
}

var newElement = document.createElement("div");
newElement.style.position = "absolute";
newElement.style.zIndex = Popup.getZ();
newElement.style.visibility = "hidden";

newElement.karmaticsPopup = this;

var dims = GU.getWindowDimensions();
GU.moveElem(newElement, dims.scrollX+1, dims.scrollY+1); //upper left
Popup.containerElem.appendChild(newElement);
this.element = newElement;
this.position = position;
if(parentElement != null && parentHiliteClassname)
	this.parentHiliteClassname = parentHiliteClassname;
this.parentElement = parentElement;
this.stackIndex = st.length;
st[st.length] = this;
if(st.length == 1)
	EH.setListener(document, 'mousedown', Popup.clickListener, false);
if (isMenu) {
  this.isMenu = true;
  GU.removeListener(document, 'mousedown', Popup.clickListener, false);
  EH.setTimerFunction([EH.setListener, [document, 'mousedown', Popup.clickListener, false]], 10);
}
  
EH.setListener (this.element, 'mouseover', Popup.mouseOver, false);	
EH.setListener (this.element, 'mouseout', Popup.mouseOut, false);	
if (parentElement) {
	parentElement.karmaticsPopupChild = this;
	EH.setListener (parentElement, 'mouseover', Popup.mouseOver, false);	
	EH.setListener (parentElement, 'mouseout', Popup.mouseOut, false);
}
if (backgroundClassname)
	this.backgroundClassname = backgroundClassname;
return this;
};

ChameleonUtils.addMembers(Popup, {
zIndex : 100,

getZ : function () {
return Popup.zIndex += 100;
},

//---------------------------------------------------
mouseOver : function () {
var p, elem = ((document.all)?window.event.srcElement:this);
if (elem.karmaticsPopup)
	p = elem.karmaticsPopup;
else if (elem.karmaticsPopupChild)
	p = elem.karmaticsPopupChild;
else
	return;
p.mouseIsIn = true;
},


//---------------------------------------------------
mouseOut : function () {
var p, elem = ((document.all)?window.event.srcElement:this);;
if (elem.karmaticsPopup)
	p = elem.karmaticsPopup;
else if (elem.karmaticsPopupChild)
	p = elem.karmaticsPopupChild;
else
	return;
p.mouseIsIn = false;
if (p.killOnMouseOut)
	ChameleonEventHandlers.setTimerFunction([Popup.mouseOutKill, [p]], 200);
},

//---------------------------------------------------
mouseOutKill : function (popup) {
if (!popup.isDead && !popup.mouseIsIn)
	popup.kill();
},

//-------------------------------------------------
getByIndex : function(index) {
return this.stack[index];
},
	
//-------------------------------------------------
clickListener : function(evt) {
var GU = ChameleonUtils, i = -1, elem = GU.getElementFromEvent(evt);
Popup.killPopups (elem);
},

//-------------------------------------------------
killPopups : function(clickedElement) {
var GU = ChameleonUtils, i = -1;
if(clickedElement) {
  var p = Popup.getFromContainedElement(clickedElement);
  if(p != null)
    i = p.stackIndex;
}   
var st = Popup.stack;

for(var j=st.length-1; j>i; j--) {
  var currP = Popup.stack[j];
  if (currP.noKillByClick)
  	return;
  if(currP.killCallback && currP.killCallback!= null)
    currP.killCallback(currP);
  currP.kill();
}
},

//-------------------------------------------------
getFromContainedElement : function(element) {
var o = element, curr, i, GU = ChameleonUtils;
var st = Popup.stack;

while(o != null) {
	for(i=0; i<st.length; i++) {
		curr = st[i].element;
		if(curr == o)
			return st[i];
	}
	o = o.parentNode;
}
return null;
},

stack : [],

containerElem : null
}); // end class methods and properties

ChameleonUtils.addMembers(Popup.prototype, {

//--------------------------------------------
show : function() {
var diff, GU = ChameleonUtils;
if(this.stackIndex < Popup.stack.length) {
	var parent = this.parentElement,
		dims = GU.getWindowDimensions(),
		pos = ((parent)?GU.getPos(parent):(GU.getPos(this.element))),
		bottom = dims.scrollY + dims.height;
	if(this.parentHiliteClassname)
		GU.modifyClassName(this.parentElement, true, this.parentHiliteClassname);
	
	switch(this.position) {
    case 0: //on the immediate right of textElem
      pos.x += parent.offsetWidth+2;
    case 1: //displayColor covering swatchElem
      pos.x += 28;
      pos.y -= 11//(this.element.offsetHeight/2)-(parent.offsetHeight/2);
      break;
    case 3: // optionMenu
      if(parent != null) {
        var change = this.element.offsetHeight * ((this.optionIndex)/this.element.menu.data.length);
        pos.y -= change;
        this.element.style.width = parent.offsetWidth+"px";
      }
    
      break;
     case 4: 
      pos.y +=	parent.offsetHeight;
      break;
	}
	diff = (pos.y + this.element.offsetHeight) - bottom;
	if((pos.x + this.element.offsetWidth) > dims.width)
		pos.x = (dims.width-5) - (this.element.offsetWidth);
	
	if (this.offsetPos) {
		pos.x += this.offsetPos.x;
		pos.y += this.offsetPos.y;
	}
	var w = dims.width - 15;
	if((pos.x + this.element.offsetWidth) > w)
		pos.x = w - (this.element.offsetWidth);
				
	if(pos.x < dims.scrollX)
		pos.x = dims.scrollX;
				
	GU.moveElem(this.element, pos.x, pos.y);
	this.element.style.visibility = "visible";
	this.element.style.display = "";
	
	if (this.backgroundClassname) {
		var e = ChameleonUtils.createDomElems(["div", {className: this.backgroundClassname, style: {zIndex: (parseInt(this.element.style.zIndex)-1).toString(), position: "absolute", width: this.element.offsetWidth + "px", 	height: this.element.offsetHeight + "px"}}]);
		GU.moveElem (e, pos.x, pos.y);
		Popup.containerElem.appendChild (e);
		this.backgroundElement = e;
	}
}
},

//-------------------------------------------------
kill : function() {
if (this.isDead)
	return;
var GU = ChameleonUtils, EH = ChameleonEventHandlers, stack = Popup.stack;
if (!this.cancel && this.cp) {
  this.cp.startRgb = this.cp.colors.rgb;
  this.cp.colors.hex = ColorPicker.rgbToHex(this.cp.colors.rgb);
  if (this.cp.elements.textElem)
    this.cp.elements.textElem.value = this.cp.hexPrefix + this.cp.colors.hex;
  this.cp.callback("final", this.cp.elements, this.cp.colors);
  this.cp.open = false;
}
ChameleonUtils.purgeChameleonEventHandlers(this.element);
this.element.innerHTML = "";
Popup.containerElem.removeChild (this.element);
if (this.backgroundElement)
	Popup.containerElem.removeChild (this.backgroundElement);
if(this.parentElement && this.parentHiliteClassname)
	GU.modifyClassName(this.parentElement, false, this.parentHiliteClassname);
if(this.parentElement) {
	GU.removeListener(this.parentElement, 'mouseover', Popup.mouseOver, false);
	GU.removeListener(this.parentElement, 'mouseout', Popup.mouseOut, false);
	this.parentElement.karmaticsPopupChild = null;
}

stack.length--;
delete(stack[this.stackIndex]);
if(stack.length == 0)
	GU.removeListener(document, 'mousedown', Popup.clickListener, false);
this.isDead = true;
}

});


///////////////////////////////////////////////////////////////////////////////////////////////////

//--------------------------------------------
//             Option Menu
//--------------------------------------------
var OptionMenu = function (callback, text, className, data, index, thisObject) {
this.callback = callback;
this.className = className;
this.data = data;
this.thisObject = thisObject;
this.index = index;

var innerElems = {};
this.button = ChameleonUtils.createDomElems (
  ["table", {cellSpacing:"0", cellPadding:"0", className: className},
    ["tbody",
      ["tr",
        ["td", {className: className+"-left"}],
        ["td", {className: className+"-middle"},
          innerElems.content = 
          ["div", {html: text}]
        ],
        ["td", {className: className+"-right"}]
      ]
    ]
  ], innerElems);
this.content = innerElems.content;
innerElems = null;

ChameleonEventHandlers.setEventHandler(this.content, "onmouseover", [OptionMenu.menuMouseHandler, [this.content, "over", {mode:0}], this]);
ChameleonEventHandlers.setEventHandler(this.content, "onmouseout", [OptionMenu.menuMouseHandler, [this.content, "out", {mode:0}], this]);

ChameleonEventHandlers.setMouseEventHandler (this.button, [OptionMenu.initMenu, [], this], {blockSelect: true}); 
return this
};

ChameleonUtils.addMembers(OptionMenu, {

//---------------------------------------------------
// menu click handler, sends menu item data to optionMenu callback and kills the popup
kill : function (data, p){
ChameleonUtils.doCallback([this.callback, [data], this.thisObject]);
p.kill();
return false;
},

//---------------------------------------------------
mouseup : function (data, p, e) {
ChameleonEventHandlers.setEventHandler(e, "onmouseup", [OptionMenu.kill, [data, p], this]);
return false;
},

//---------------------------------------------------
// menu optionMenu initialize, builds the menu popup and displays it
initMenu : function (args, type) {
switch (type) {
  case "down":
    var p = new Popup(this.button, 3, "hidden", "kcs-menuTranslucentBG", true);
    p.element.style.cursor = "pointer";
    p.element.className = "kcs-menu";
    p.element.menu = {data:this.data};
    p.optionIndex = this.index;
    for (var i=0; i<this.data.length; i++) {
      var e = ChameleonUtils.createDomElems(["a", {
          href: "#",
          menuIndex: i,
          menuData: this.data[i]
          }]);
      var current = false;
      ChameleonEventHandlers.setEventHandler(e, "onmousemove", [OptionMenu.mouseup, [this.data[i], p, e], this]);
      ChameleonEventHandlers.setEventHandler(e, "onclick", [OptionMenu.kill, [this.data[i],p], this]);
      e.style.textAlign = "center";
      if (i==this.index) {
        e.className = "current";
        current = true;
        ChameleonUtils.doCallback([OptionMenu.menuMouseHandler, [e, "over", {current:true, mode:1}], this]);
      } 
      ChameleonEventHandlers.setEventHandler(e, "onmouseover", [OptionMenu.menuMouseHandler, [e, "over", {current:current, mode:1}], this]);
      ChameleonEventHandlers.setEventHandler(e, "onmouseout", [OptionMenu.menuMouseHandler, [e, "out", {current:current, mode:1}], this]);             
      e.innerHTML = this.data[i][0];
      p.element.appendChild (e);
    }
    p.show();
    break;
}
},

//---------------------------------------------------
menuMouseHandler : function (elem, type, args) {
var color = "#ddd", background = "", border = "transparent", img = "white";
if (args.mode==0) {
  switch (type) {
    case "over":
      color = "#ffe888";
      img = "hilite";
    case "out":
      elem.style.color = color;
      elem.style.backgroundImage = "url('http://web.archive.org/web/20101124083638/http://karmatics.com/new/chameleon/img/downarrow"+img+"tiny.png')";
      break;
  }
} else {
  switch (type) {
    case "over":
      color = "#eee";
      background = "#000";
      border = "#eee transparent";
      img = "hilite"
    case "out":
      elem.style.color = color;
      elem.style.backgroundColor = background;
      elem.style.borderColor = border;
      if (args.current)
        elem.style.backgroundImage = "url('http://web.archive.org/web/20101124083638/http://karmatics.com/new/chameleon/img/rightarrow"+img+"tiny.png')";
      break;
  }
}
}
});

///////////////////////////////////////////////////////////////////////////////////////////////////

//--------------------------------------------
//              Color Picker
//--------------------------------------------
var ColorPicker = function (elements, callback, mode, karma) {
this.elements = elements;
this.callback = callback;
this.mode = (mode.toLowerCase()=="triangle")? 0 : 1;
this.karma = karma;
this.menuData = [["Triangle", 0],["Wheel", 1]];
if (this.karma=="good")
  this.menuData[this.menuData.length] = ["About", 2];
if (this.elements.textElem) {
  this.colors.hex = this.startHex = this.elements.textElem.value;
  this.inputHex(this.colors.hex);
  if (this.elements.swatchElem)
    this.elements.swatchElem.style.backgroundColor = this.colors.hex;
} else {
  var bgColor=this.elements.swatchElem.style.backgroundColor;
  if (bgColor.charAt(0)=="#") {
    this.colors.hex = this.startHex = bgColor.slice(1);
    this.startRgb = ColorPicker.hexToRgb(this.startHex);
  } else {
    var rgb = bgColor.match(/\d+/g);
    for (var i=0; i<3; i++)
      this.startRgb[i] = rgb[i]/255;
    this.colors.hex = this.startHex = ColorPicker.rgbToHex(this.startRgb);
  }
}
};

ChameleonUtils.addMembers(ColorPicker.prototype, {
colors : {rgb: [], hex: ""},
startRgb : [],
startHex : "",
hexPrefix : "",
open : false,

//---------------------------------------------------
show : function () {
if (this.elements.textElem) {
  this.popup = new Popup(this.elements.textElem, 0, "", "kcp-translucentBG");
  this.startHex = this.elements.textElem.value;
} else
  this.popup = new Popup(this.elements.swatchElem, 1, "", "kcp-translucentBG");
this.popup.element.appendChild(this.buildElems());
this.popup.cp = this;
this.createPicker(ColorPicker.getHsvFromRgb(this.startRgb));
this.popup.show();
ChameleonUtils.scrollWindowToElement(this.popup.element);
this.popup.element.zIndex 
this.open = true;
},

//---------------------------------------------------
// determines if hex is valid, and if so use it
inputHex : function (hex) {
if (hex.charAt(0)=="#") {
  this.hexPrefix = "#";
  hex = hex.slice(1);
} else
  this.hexPrefix = "";
var hsv, rgb = ColorPicker.hexToRgb(hex);
if (this.open) {
  this.colors.rgb = rgb;
  hsv = ColorPicker.getHsvFromRgb(this.colors.rgb);
  this.updatePicker(hsv);
} else {
  this.startRgb = rgb;
  if (this.elements.swatchElem) {
    this.elements.swatchElem.style.backgroundColor = "rgb("+Math.round(255*this.startRgb[0])+","+
          Math.round(255*this.startRgb[1])+","+
          Math.round(255*this.startRgb[2])+")";
  }
}
},

//---------------------------------------------------
// constructs color picker 
buildElems : function () {
var container, cp = ColorPicker, GU = ChameleonUtils, EH = ChameleonEventHandlers, innerElems = {};
innerElems.modeButton = new OptionMenu(this.modeSelectHandler, this.menuData[this.mode][0], "kcp-optbut", this.menuData, this.mode, this);
container = GU.createDomElems(["div", {className:"kcp-container kcp-default"},
  innerElems.modeButton.button,
  innerElems.sliderContainer =
    ["div", {className:"kcp-sliderContainer"}],
  innerElems.displayColor = 
    ["div", {className:"kcp-display"}],
  innerElems.okcancel =
    ["table", {cellSpacing:"0", cellPadding:"0", className:"kcp-okcancel"},
      ["tbody",
        ["tr",
          innerElems.ok =
            ["td", {className:"kcp-top"}, "ok"]
        ],
        ["tr",
          innerElems.cancel =
            ["td", {className:"kcp-bottom"}, "cancel"]
        ]
      ]
    ]
], innerElems);

if (this.karma=="good" && this.mode!=2) {
var chameleon = GU.createDomElems(["img", 
  {src:ColorPicker.chameleonSrc+"/img/cutechameleon.png",
  style:{position:"absolute", zIndex:"-5"}}]);
container.appendChild(chameleon);
GU.moveElem(chameleon, 73, -45);
EH.setTimerFunction([ColorPicker.fadeChameleon, [100, chameleon], this], 750);
}

for (var i in innerElems)
  this[i] = innerElems[i];
EH.setMouseEventHandler(this.ok, [this.okCancelMouseHandler, 
  {callback: [this.popup.kill, null, this.popup], ok: true}, this.ok]);
EH.setMouseEventHandler(this.cancel, [this.okCancelMouseHandler, 
  {callback: [this.closeCancel, null, this]}, this.cancel]);
innerElems = null;
return container;
},

//---------------------------------------------------
// handles style changes of ok/cancel button
okCancelMouseHandler : function (args, type, elem, event) {
switch (type) {
  case "click":
    ChameleonUtils.doCallback(args.callback);
    break;
  case "over":
    this.style.color = "#ffe888";
    break;
  case "out":
    this.style.color = "#ddd";
    break;
}    
},

//---------------------------------------------------
// callback from optionMenu
modeSelectHandler : function(data) { 
this.mode = this.modeButton.index = data[1];
this.createPicker(ColorPicker.getHsvFromRgb(this.colors.rgb));
this.modeButton.content.innerHTML = data[0];
},

//---------------------------------------------------
createPicker : function (hsv) {
if (this.picker) {
  ChameleonUtils.purgeChameleonEventHandlers(this.picker.element);
}
if (this.mode==0) {
  this.picker = new TrianglePicker(this, hsv);
} else if (this.mode==1) {
  this.picker = new WheelPicker(this, hsv);
} else {
  this.picker = new AboutPage(this, hsv);
}
this.sliderContainer.removeChild(this.sliderContainer.firstChild);
this.sliderContainer.appendChild(this.picker.element);
},

//---------------------------------------------------
updatePicker : function (hsv) {
this.picker.hsv = hsv;
this.picker.updateColors(hsv, false);
this.picker.initThumbs(hsv);
this.picker.setImages();
},

//---------------------------------------------------
// restores all color displays back to start values
closeCancel : function () {
this.colors.rgb = this.startRgb;
this.picker.updateColors(ColorPicker.getHsvFromRgb(this.colors.rgb), false);
if (this.elements.textElem)
  this.elements.textElem.value = this.startHex;
this.callback("cancel", this.elements, this.colors);
this.popup.cancel = true;
this.popup.kill();
this.open = false;
}

});


ChameleonUtils.addMembers(ColorPicker, {

chameleonSrc : "http://web.archive.org/web/20101124083638/http://karmatics.com/chameleon",

//---------------------------------------------------
fadeChameleon : function (opacity, elem) {
if (!this.open) return;
if (opacity>0) {
  elem.style.filter = "alpha(opacity=" + opacity + ")";
  elem.style.opacity = opacity/100;
  ChameleonEventHandlers.setTimerFunction([ColorPicker.fadeChameleon, [opacity-5, elem]], 10);
} else {
  elem.parentNode.removeChild(elem);
}
},

//---------------------------------------------------
//converts rgb values to hex
rgbToHex : function (rgb) {
var s = "", hexChars = "0123456789abcdef";
for (var i=0; i<3; i++) {
  var val = Math.round(rgb[i]*255);
  s += hexChars.charAt((val-val%16)/16) + hexChars.charAt(val%16);
}
return s;
},

//---------------------------------------------------
hexToRgb : function (hex) {
var factor, offset, s = "", rgb = [], hexChars = "0123456789abcdef";
var a = 3-(hex.length%3);
if (a==3) {
  if (hex.length==0)
    hex = "888";
} else {
  for (var i = 0; i<a; i++)
    hex = hex.concat("8");
}
factor = hex.length/3;
if (factor>2)
  hex.length = 5;
offset = Math.floor(.5*factor);
var first, second;
for (var i=0;i<3;i++) {
  first = hexChars.indexOf(hex.charAt(i*factor)); //invalid characters
  second = hexChars.indexOf(hex.charAt((i*factor)+offset));
  if (first < 0 || second < 0) {
    return [.5,.5,.5];
  }
  rgb[i] = (first*16)+second;
  rgb[i] /= 255;
}
return rgb;
},

//---------------------------------------------------
// returns array of rgbs between 0 and 1
getRgbFromHsv : function (hue, sat, val) {
var rgb = [];
hue = hue%360;

// first, get the pure hue
var ratio = (hue % 60) / 60;
var whichPrimary = Math.floor(hue / 120);
var increasing = ((hue % 120) < 60);

if (increasing) {
	rgb[whichPrimary] = 1;
	rgb[(whichPrimary+1)%3] = ratio;
	rgb[(whichPrimary+2)%3] = 0;
}
else {
	rgb[whichPrimary] = 1-ratio;
	rgb[(whichPrimary+1)%3] = 1;
	rgb[(whichPrimary+2)%3] = 0;
}
	
// now mix the pure hue with the appropriate shade of gray
// (determined by the value), by the appropriate proportion
// (determined by the saturation)
for (var i=0; i<3; i++) {
	rgb[i] = (rgb[i] * sat) + (val * (1-sat));
}	
return rgb;
},

//---------------------------------------------------
// get hsv values from rgb
// 0-1
getHsvFromRgb : function (rgb) {
var hsv = {};
var scaledMid;

// find which values are max and min
var max = 0, mid, min = 0;
for (var i=1;i<rgb.length;i++) {
  if (rgb[i]>rgb[max])
    max = i;
  if (rgb[i]<rgb[min])
    min = i;  
}
// find mid, must be a better way to do this
if (((max+1)%3)==min)
  mid = (max+2)%3;
else
  mid = (max+1)%3;

 if (rgb[max]==rgb[min]) {
  scaledMid = 0;
  hsv.saturation = 0;
} else {
  scaledMid = (rgb[mid]-rgb[min])/(rgb[max]-rgb[min]);
  // find saturation using similar triangles 
  // using known side lengths and the known altitude (1 for the larger triangle)
  // altitude of the smaller triangle is saturation
  if (scaledMid<0.5)
    hsv.saturation = (rgb[max]-rgb[mid])/(1-scaledMid);
  else
    hsv.saturation = (rgb[mid]-rgb[min])/scaledMid;
}

// find hue
hsv.hue = 60*(scaledMid);
if ((max+2)%3==mid) {
  hsv.hue = -hsv.hue
  if (max==0)
    hsv.hue += 360;
}
hsv.hue += 120*max;

//find value by using y=mx+b, value = y-intercept = b
// use min line for simplicity (1,0), b=y-mx -> b = 0-1m -> b=-m
if (rgb[min]==0)
  hsv.value = 0;
else {
  hsv.value = rgb[min]/(1-hsv.saturation);
  if (hsv.value>1 || hsv.value<0) //why does this happen?
    hsv.value = Math.round(hsv.value);
}
return hsv;
}

});


//--------------------------------------------
//              General Picker
//--------------------------------------------
var GeneralPicker = function () {}

ChameleonUtils.addMembers(GeneralPicker.prototype, {

//---------------------------------------------------
// build picker dom elems
buildPicker : function (className) {
var geoSlider, barSlider, GU = ChameleonUtils, EH = ChameleonEventHandlers, innerElems = {};

// build geometric slider dom elements
this.element = GU.createDomElems(["div",
  innerElems.geoSlider = 
    ["div", {className: className+" unselectable"},
      innerElems.gthumb =
        ["div", {className: "kcp-geoThumb"}]
    ],
// build bar slider dom elements
  innerElems.barSlider = 
    ["div", {className: "kcp-barSlider"},
      innerElems.bthumb =
        ["div", {className: "kcp-barThumb"}]
    ]
], innerElems);

this.geoSlider = innerElems.geoSlider;
this.barSlider = innerElems.barSlider;
this.geoSlider.thumb = innerElems.gthumb;
this.barSlider.thumb = innerElems.bthumb;
innerElems = null;

// build and utilize picker images
this.setImages();

// attach event handlers
EH.setMouseEventHandler(this.geoSlider, 
    [this.mouseEventHandler, {o: this, clickHandler: this.geoClickHandler, dragHandler: this.geoDragHandler}, this.geoSlider],
    {draggable: true, blockSelect: true});
EH.setMouseEventHandler(this.barSlider, 
    [this.mouseEventHandler, {o: this, clickHandler: this.barClickHandler, dragHandler: this.barDragHandler},this.barSlider],
    {draggable: true, blockSelect: true});
},

//---------------------------------------------------
updateColors : function (hsv, output) {
var cp = this.cp;
cp.colors.rgb = ColorPicker.getRgbFromHsv(hsv.hue, hsv.saturation, hsv.value);
cp.colors.hex = ColorPicker.rgbToHex(this.cp.colors.rgb);
cp.displayColor.style.backgroundColor = 
  this.geoSlider.thumb.style.backgroundColor = "rgb("+Math.round(255*cp.colors.rgb[0])+","+
    Math.round(255*cp.colors.rgb[1])+","+
    Math.round(255*cp.colors.rgb[2])+")";
this.pureColor = this.updatePureColor(hsv);
this.barSlider.thumb.style.backgroundColor = "rgb("+Math.round(255*this.pureColor[0])+","+
    Math.round(255*this.pureColor[1])+","+
    Math.round(255*this.pureColor[2])+")";
if (cp.elements.textElem && output)
  cp.elements.textElem.value = cp.hexPrefix+cp.colors.hex;
if (cp.elements.swatchElem)
  cp.elements.swatchElem.style.backgroundColor = cp.displayColor.style.backgroundColor;
},

//--------------------------------------------
mouseEventHandler : function (args, type, elem, event) {
var o = args.o;
switch (type) {
  case "startdrag":
    this.startMousePos = ChameleonUtils.getMousePosFromEvent(event);
    this.startElemPos = ChameleonUtils.getPos(this.thumb);
    this.thumb.style.zIndex = "25000";
    this.offset = ChameleonUtils.getPos(this); //position of containing element, needed to adjust final positions, could this be set in constructor?
    if (this.startMousePos.x<this.startElemPos.x || this.startMousePos.x>(this.startElemPos.x+this.thumb.offsetWidth) ||
        this.startMousePos.y<this.startElemPos.y || this.startMousePos.y>(this.startElemPos.y+this.thumb.offsetHeight)) {
      this.startElemPos = args.clickHandler(this.startMousePos, o);
      if (this.startElemPos == null)
        return;
      this.startMousePos = {x: this.startElemPos.x + this.thumb.offsetWidth/2,
                            y: this.startElemPos.y + this.thumb.offsetHeight/2};
      ChameleonUtils.moveElem(this.thumb, this.startElemPos.x, this.startElemPos.y);
      o.setImages();
      o.updateColors(o.hsv, true);
      o.cp.callback("move", o.cp.elements, o.cp.colors);
    }
    break;
  case "drag":
    var pos = ChameleonUtils.getMousePosFromEvent(event); // check if ff
    var diff = {x: pos.x - this.startMousePos.x,
                y: pos.y - this.startMousePos.y};
    var finalPos = {x: this.startElemPos.x+diff.x-this.offset.x, // x position elem will be moved to
                    y: this.startElemPos.y+diff.y-this.offset.y}; // y position elem will be moved to
    finalPos = args.dragHandler(pos, diff, finalPos, o);
    o.updateColors(o.hsv, true);
    o.cp.callback("move", o.cp.elements, o.cp.colors);
    ChameleonUtils.moveElem(this.thumb, finalPos.x, finalPos.y);
    break;
  case "enddrag":
    o.updateColors(o.hsv);
    o.cp.callback("release", o.cp.elements, o.cp.colors);
    this.thumb.style.zIndex = "";
    break;
}
return true;
},

//---------------------------------------------------
barDragHandler : function (pos, diff, finalPos, o) {   
var bs = o.barSlider;     
if (finalPos.x < -bs.thumb.offsetWidth/2)
  finalPos.x = -bs.thumb.offsetWidth/2;
else if (finalPos.x > (bs.offsetWidth-bs.thumb.offsetWidth/2))
  finalPos.x = bs.offsetWidth-bs.thumb.offsetWidth/2;
finalPos.y = ChameleonUtils.getPos(bs.thumb).y-ChameleonUtils.getPos(bs).y;
o.barHandler(finalPos);
o.setImages();
return finalPos;
},

//---------------------------------------------------
barClickHandler : function (mousePos, o) {
var bs = o.barSlider
mousePos.x -= bs.offset.x+(bs.thumb.offsetWidth/2);
mousePos.y = ChameleonUtils.getPos(bs.thumb).y-ChameleonUtils.getPos(bs).y;
o.barHandler(mousePos);
return mousePos;
}

}
);


//--------------------------------------------
//              Triangle Picker
//--------------------------------------------
var TrianglePicker = function (cp, hsv) { //triangle picker constructor
this.cp = cp;
this.hsv = hsv;
this.buildPicker("kcp-triangleSlider");
this.cp.sliderContainer.appendChild(this.element);
this.updateColors(this.hsv, false);
this.initThumbs(this.hsv);
};

TrianglePicker.prototype = new GeneralPicker();

ChameleonUtils.addMembers(TrianglePicker.prototype, {

//---------------------------------------------------
// initializes triangle slider positions
initThumbs : function(hsv) {
var s = this.geoSlider, bs = this.barSlider, GU = ChameleonUtils,
    y = 1-hsv.saturation, //scaled y value
    w = s.offsetWidth-4,//s.thumb.offsetWidth+8, //width of triangle base
    h = s.offsetHeight-5,//(s.thumb.offsetHeight/2), //height of triangle
    f = {x: (((hsv.value-0.5)*y+.5)*w), y: y*h}; //final position
GU.moveElem(s.thumb, f.x-(s.thumb.offsetWidth/2)+2, f.y-(s.thumb.offsetWidth/2)+2);
f.x = hsv.hue/(360/bs.offsetWidth);
GU.moveElem(bs.thumb, (f.x-(bs.thumb.offsetWidth/2)), (GU.getPos(bs.thumb).y-GU.getPos(bs).y)); // move bar slider
},

//---------------------------------------------------
updatePureColor : function (hsv) {
return ColorPicker.getRgbFromHsv(hsv.hue, 1, 1);
},

//---------------------------------------------------
// updates color picker triangle to show correct hue
setImages : function () {
hue = this.hsv.hue % 360;
var which = Math.floor(hue / 60);
var ratio = (hue - (which*60)) / 60;
if(ratio<0.01)
  ratio = 0;
if (this.image == null) { //picker just created, create image object
  this.image = ChameleonUtils.createDomElems (["img", 
     {src: ColorPicker.chameleonSrc + (which+1)%6 + ".png",
     className: "unselectable"
  }]);
  this.geoSlider.appendChild(this.image);
  this.barSlider.style.backgroundImage = "url("+ColorPicker.chameleonSrc+"/img/hueBar.png)";
}
this.geoSlider.style.background = "url("+ColorPicker.chameleonSrc+"/img/" + which + ".png) no-repeat";
this.image.style.filter = "alpha(opacity=" + (ratio*100) + ")";
this.image.style.opacity = ratio;
this.image.src = ColorPicker.chameleonSrc+"/img/" + (which+1)%6 + ".png";
},

//---------------------------------------------------
geoDragHandler : function (pos, diff, finalPos, o) {
var gs = o.geoSlider;
return o.geoHandler(gs, {x:pos.x-(gs.startMousePos.x-gs.startElemPos.x)+(gs.thumb.offsetWidth/2), //x
    y:pos.y-(gs.startMousePos.y-gs.startElemPos.y)+(gs.thumb.offsetHeight/2)});
},

//---------------------------------------------------
geoClickHandler : function (mousePos, o) {
var gs = o.geoSlider;
if (o.convertCoords(mousePos.x, mousePos.y, gs.offset.x-4, gs.offset.y, gs.offsetWidth+8, gs.offsetHeight-4, true)) //point within triangle?
  return o.geoHandler(gs, mousePos);
else//outside triangle
  return null;
},

//----------------------------------------------------
geoHandler : function (elem, mousePos) {
var data = this.convertCoords(mousePos,
    {x: elem.offset.x+2, y: elem.offset.y+2}, // triangle elem corner
    elem.offsetWidth-4, //base width, +8 triangle offset
    elem.offsetHeight-5, //height, -4 triangle offset
    false); //not click
this.hsv.saturation = data.saturation;
this.hsv.value = data.value;
mousePos = {x: data.x-elem.offset.x-(elem.thumb.offsetWidth/2),
            y: data.y-elem.offset.y-(elem.thumb.offsetHeight/2)};
return mousePos;
},

//---------------------------------------------------
barHandler : function (pos) {
this.hsv.hue = (pos.x+(this.barSlider.thumb.offsetWidth/2)) * (360/this.barSlider.offsetWidth);
},


//----------------------------------------------------
// given a triangle widget's dimensions, and the
// mouse cursor pos, convert to a position within
// the triangle.  While we're at it, calc value and
// saturation
convertCoords : function (
mousePos,  // mousePos
trianglePos, // left corner of square containing triangle
width,  // width of base of triangle
height,  // height of triangle
isClick  // called from click function
) {
var finalPos = {};
var scaledX = (mousePos.x - trianglePos.x) / width;
var scaledY = (mousePos.y - trianglePos.y) / height;
var xFromCenter = scaledX - .5;
var val = (xFromCenter / scaledY);

if (val > .5 || val < -.5 || scaledY < 0) { //left, right, or above triangle
  if (isClick) {
    return false;
  }
  if (scaledY<0)
    val = -val;
  var GU = ChameleonUtils
      p = {x: trianglePos.x+(width/2), y: trianglePos.y},
      vT = GU.makeVector({x: (val>.5)?(trianglePos.x+width):trianglePos.x, y: trianglePos.y+height}, p),
      vM = GU.makeVector({x: mousePos.x, y: mousePos.y}, p),
      mag = GU.getMagnitude(vT),
      d = GU.dotProduct(vM, vT)/mag;   
  vT.x /= mag;
  vT.y /= mag;
  d = (d<0)?0:(d>mag)?mag:d;
  finalPos = GU.projectPoint(p, vT, d);
  val = (val > .5)?.5:-.5;
} else {
  if (scaledY > 1) { //below triangle
    if (isClick) {
      return false;
    }
    scaledY = 1;
  }
  if (isClick) {
    return true;
  }
  finalPos.x = trianglePos.x + ((val*scaledY+.5)*width);
  finalPos.y = trianglePos.y + (scaledY * height);
}

scaledY = (finalPos.y - trianglePos.y) / height;

return { saturation: 1 - scaledY, value: val + .5,
    x: finalPos.x,
    y: finalPos.y};
}

});


//--------------------------------------------
//              Wheel Picker
//--------------------------------------------
var WheelPicker = function(cp, hsv) {
this.cp = cp;
this.hsv = hsv;
this.buildPicker("kcp-wheelSlider");
this.cp.sliderContainer.appendChild(this.element);
this.updateColors(this.hsv, false);
this.initThumbs(this.hsv);
};

WheelPicker.prototype = new GeneralPicker();

ChameleonUtils.addMembers(WheelPicker.prototype, {

//---------------------------------------------------
//initializes slider positions to appropriate positions
initThumbs : function(hsv) {
var s = this.geoSlider, bs = this.barSlider, GU = ChameleonUtils,
    r = s.offsetWidth/2, //radius
    h = hsv.saturation*(r-5), //hypotenuse
    rads = hsv.hue*(Math.PI/180), //radians
    f = {x: h*Math.cos(rads), y: h*Math.sin(rads)}; //final position
GU.moveElem(s.thumb, f.x+r-(s.thumb.offsetWidth/2), f.y+r-(s.thumb.offsetHeight/2)); // move circle slider
f.x = hsv.value*bs.offsetWidth;
GU.moveElem(bs.thumb, f.x-(bs.thumb.offsetWidth/2), (GU.getPos(bs.thumb).y-GU.getPos(bs).y)); // move bar slider
},

//---------------------------------------------------
updatePureColor : function (hsv) {
return ColorPicker.getRgbFromHsv(0, 0, hsv.value); //pure value, for barSlider thumb
},

//----------------------------------------------------
// updates color wheel value
setImages : function () {
if (this.image == null) { //first created
  this.image = ChameleonUtils.createDomElems (["img", 
     {src: ColorPicker.chameleonSrc+"/img/c0.png",
      className: "unselectable",
      zIndex: 5}]);
  this.geoSlider.style.backgroundImage = "url("+ColorPicker.chameleonSrc+"/img/c1.png)";  
  this.geoSlider.appendChild(this.image);
  this.barSlider.style.backgroundImage = "url("+ColorPicker.chameleonSrc+"/img/valueBar.png)";
}
this.image.style.filter = "alpha(opacity=" + ((1-this.hsv.value)*100) + ")";
this.image.style.opacity = 1-this.hsv.value;
},

//---------------------------------------------------
geoDragHandler : function (pos, diff, finalPos, o) {
var gs = o.geoSlider;
return o.geoHandler(gs, {x:pos.x-(gs.startMousePos.x-gs.startElemPos.x)+(gs.thumb.offsetWidth/2), //x
    y:pos.y-(gs.startMousePos.y-gs.startElemPos.y)+(gs.thumb.offsetHeight/2)});
},

//---------------------------------------------------
geoClickHandler : function (mousePos, o) {
var gs = o.geoSlider
if (o.convertCoords(mousePos.x, mousePos.y, gs.offset.x, gs.offset.y, gs.offsetWidth, true))
  return o.geoHandler(gs, mousePos);
else
  return null;
},

//---------------------------------------------------
geoHandler : function (elem, mousePos) {
var data = this.convertCoords(mousePos,
    {x: elem.offset.x, y: elem.offset.y},
    elem.offsetWidth,
    false);
this.hsv.saturation = data.saturation;
this.hsv.hue = data.hue;
mousePos = {x: data.x-elem.offset.x-(elem.thumb.offsetWidth/2),
    y: data.y-elem.offset.y-(elem.thumb.offsetHeight/2)};
return mousePos;
},

//---------------------------------------------------
barHandler : function (pos) {
this.hsv.value = (pos.x+(this.barSlider.thumb.offsetWidth/2))/this.barSlider.offsetWidth;
},

//---------------------------------------------------
convertCoords : function (
mousePos, //mouse position
circlePos, // top left corner of circle elem
diameter, // circle width or height
isClick // called from click function
) {
var saturation, hue;
var radius = (diameter/2)-5,//-(cp.slider.bar.offsetWidth/2),
    center = {x:circlePos.x+(diameter/2), y:circlePos.y+(diameter/2)}, // center of circle
    hyp = ChameleonUtils.getDistance(mousePos, center), // distance from mouse to center, hypotenuse
    cPos = {x: mousePos.x-center.x,y: mousePos.y-center.y}; // x and y relative to the center of the circle, bad naming
if (hyp>radius) {
  if (isClick)
    return false;
  cPos.x = (cPos.x*radius)/hyp;
  cPos.y = (cPos.y*radius)/hyp;
  hyp = radius;
} else if (isClick)
  return true;
if (hyp<3)
  saturation = 0;
else
  saturation = hyp/radius;
if (hyp==0)
  hue = 0; //change this
else {
  var theta = Math.asin(cPos.y/hyp)*(180/Math.PI);
  if (cPos.x>0)
    hue = (360+theta)%360;
  else
    hue = 180-theta;
}
return {hue: hue, saturation: saturation,
        x: cPos.x+center.x, y: cPos.y+center.y};
}

});


//--------------------------------------------
//              About Page
//--------------------------------------------
var AboutPage = function(cp, hsv) {
this.cp = cp;
this.hsv = hsv;
var GU = ChameleonUtils;
var innerElems = {}
this.element = GU.createDomElems(
  ["div", {className:"kcp-about"},
  ["h1", "Chameleon Color Picker"],
    "(and Karma the chameleon)",
  	["br"],
    "by ",
    ["a", {href:"http://web.archive.org/web/20101124083638/http://www.karmatics.com/", style:{textDecoration: "underline"}
    }, "Karmatics"],
    ["br"],
    ["br"],
    "100% free and open source",
  ]);

this.updateColors(this.hsv);

this.image = GU.createDomElems(["img", 
  {src:"http://web.archive.org/web/20101124083638/http://karmatics.com/new/chameleon/img/cutechameleon.png",
  style:{position:"absolute", zIndex:"-5"}}]);
this.element.appendChild(this.image);

cp.sliderContainer.appendChild(this.element);
GU.moveElem(this.image, 73, -45);
};

ChameleonUtils.addMembers(AboutPage.prototype, {

//---------------------------------------------------
updateColors : function (hsv) {
var cp = this.cp;
cp.colors.rgb = ColorPicker.getRgbFromHsv(hsv.hue, hsv.saturation, hsv.value);
cp.colors.hex = "#"+ColorPicker.rgbToHex(this.cp.colors.rgb);
cp.displayColor.style.backgroundColor = "rgb("+Math.round(255*cp.colors.rgb[0])+","+
    Math.round(255*cp.colors.rgb[1])+","+
    Math.round(255*cp.colors.rgb[2])+")";
if (cp.elements.textElem)
  cp.elements.textElem.value = cp.colors.hex;
if (cp.elements.swatchElem)
  cp.elements.swatchElem.style.backgroundColor = cp.displayColor.style.backgroundColor;
}
});


///////////////////////////////////////////////////////////////////////////////////////////////////

//--------------------------------------------
//             Chameleon
//--------------------------------------------
var Chameleon = {

//---------------------------------------------------
// this is called when source file is loaded
init : function () {
Chameleon.createCSS(Chameleon.kcpCSS);
if (typeof ChameleonSettings != "undefined") {
  var a = ChameleonSettings.elements, i;
  if (a) {
    for (i in a) {
      Chameleon.addToElement (a[i]);
      }
    }
  if (ChameleonSettings.idRange) {
    for (i=ChameleonSettings.idRange.start; i<=ChameleonSettings.idRange.end; i++) {
      Chameleon.addToElement (ChameleonSettings.idRange.prefix + i);
    }
  if (ChameleonSettings.callback)
  	ChameleonSettings.callback("sourceloaded", null, null);
  }
} else {
  Chameleon.initBookmarklet();
}
},

//---------------------------------------------------
//attaches color picker to every text input element, displays intro box, and provides kill ability
initBookmarklet : function () {
var a = document.getElementsByTagName("INPUT"), i, l;
if (a) {
  l = a.length;
  for (i=0; i<l; i++) {
    if (a[i].type.toLowerCase() == "text" || a[i].type == "") {
      var e = {textElem: a[i], idElem: a[i], swatchElem: null};
      var c = new ColorPicker(e, function(){}, "triangle", "good");
      ChameleonEventHandlers.setEventHandler(c.elements.textElem, "onkeyup", [function(){this.inputHex(this.elements.textElem.value);}, [], c]); //kind of hacky
      ChameleonEventHandlers.setEventHandler(c.elements.textElem, "onclick", [c.show, [], c]);
    }
  } 
  var innerElems = {}, dims = ChameleonUtils.getWindowDimensions();;
  Chameleon.greetBox = ChameleonUtils.createDomElems(["div", {className:"kcp-greet"},
    ["h1", "Chameleon", ["br"], "Color Picker"],
    ["p", "click on any text input element to begin"],
    innerElems.quit = 
     ["a", {className:"kcp-greetQuit"}, "x"]
    ], innerElems);
  Chameleon.quitButton = innerElems.quit
  innerElems = null;
  Chameleon.quitButton.onmouseover = function(){this.style.color = "#fff";};
  Chameleon.quitButton.onmouseout = function(){this.style.color = "darkgreen";};
  
  document.body.appendChild(Chameleon.greetBox); 
  ChameleonEventHandlers.setMouseEventHandler(Chameleon.greetBox, 
   [Chameleon.greetBoxDrag, [], Chameleon.greetBox],
   {draggable: true, blockSelect: true});
  ChameleonEventHandlers.setListener(Chameleon.quitButton, "click", Chameleon.killBookmarklet);
  ChameleonUtils.moveElem(Chameleon.greetBox, dims.scrollX+50, dims.scrollY+50);
}
},

//---------------------------------------------------
killBookmarklet : function () {
var st = Popup.stack, i = -1;
for(var j=st.length-1; j>i; j--) {
  var currP = Popup.stack[j];
  currP.kill();
}
var a = document.getElementsByTagName("INPUT"), i, l;
if (a) {
  l = a.length;
  for (i=0; i<l; i++) {
    if (a[i].type.toLowerCase() == "text" || a[i].type == "") {
      a[i].onclick = null;
      a[i].onkeyup = null;
    }
  }
}
ChameleonEventHandlers.cancelListener(Chameleon.quitButton, "click", Chameleon.killBookmarklet);
ChameleonUtils.purgeChameleonEventHandlers(Chameleon.greetBox);
document.body.removeChild(Chameleon.greetBox);
},

//---------------------------------------------------
greetBoxDrag : function (args, type, elem, event) {
switch (type) {
  case "startdrag":
    elem.startMousePos = ChameleonUtils.getMousePosFromEvent(event);
    elem.startElemPos = ChameleonUtils.getPos(elem);
    elem.offset = ChameleonUtils.getPos(elem); //position of containing element, needed to adjust final positions, could this be set in constructor?
    break;
  case "drag":
    var pos = ChameleonUtils.getMousePosFromEvent(event); // check if ff
    var diff = {x: pos.x - elem.startMousePos.x,
                y: pos.y - elem.startMousePos.y};
    var finalPos = {x: elem.startElemPos.x+diff.x, // x position elem will be moved to
                    y: elem.startElemPos.y+diff.y}; // y position elem will be moved to
    ChameleonUtils.moveElem(elem, finalPos.x, finalPos.y);
    break;
  case "enddrag":
    break;
}
return true;
},

//---------------------------------------------------
// given an element (or an element id), try to do the right thing
addToElement : function (e) {
if (typeof(e) == "string") {
  e = document.getElementById(e);
  if (e == null)
    return;
  }		
if (e.tagName == "INPUT" && e.type == "text") {
  if (((s = Chameleon.adjacentElement (e, true)) && s.tagName == "DIV" && s.innerHTML.length == 0) || ((s = Chameleon.adjacentElement (e, false)) && s.tagName == "DIV" && s.innerHTML.length == 0))
    return Chameleon.initElements (e, e, s);
  else
    return Chameleon.initElements (e, e, null);
} else if (e.tagName == "DIV" || e.tagName == "TD" || e.tagName == "P" || e.tagName == "SPAN") {
  var count = 0, t, textElems = e.getElementsByTagName ("INPUT");
  for (var j=0; j<textElems.length; j++) {
    t = textElems[j];
    if (t.type == "text") {
      count++;
    }
  }
  if (count == 1 && t.parentNode == e) {
    var s;
    if (((s = Chameleon.adjacentElement (t, true)) && s.tagName == "DIV" && s.innerHTML.length == 0) || ((s = Chameleon.adjacentElement (t, false)) && s.tagName == "DIV" && s.innerHTML.length == 0))
      return Chameleon.initElements (e, t, s);
    else
      return Chameleon.initElements (e, t, null);
  }
  if (e.tagName == "DIV" || e.tagName =="TD")
    return Chameleon.initElements (e, null, e);
} else if (e.tagName == "TR") {
  var count = 0, t, textElems = e.getElementsByTagName ("INPUT");
  for (var j=0; j<textElems.length; j++) {
    t = textElems[j];
    var td = t.parentNode;
    if (td.tagName == "TD" && ((s = Chameleon.adjacentElement (td, true)) && s.tagName == "TD" && s.innerHTML.length == 0) || ((s = Chameleon.adjacentElement (td, false)) && s.tagName == "TD" && s.innerHTML.length == 0))
      return Chameleon.initElements (e, t, s);
  }
}
},

//---------------------------------------------------
initElements : function (idElem, textElem, swatchElem, callback) {
var s = ChameleonSettings, EH = ChameleonEventHandlers, a = swatchElem,
    e = {idElem: idElem, textElem: textElem, swatchElem: swatchElem};
if (callback == null)
	callback = s.callback;
if (callback == null)
  callback = function(){}; // if no callback make a dummy one
var c = new ColorPicker(e, callback, s.defaultMode, s.karma);
if (textElem)
  EH.setEventHandler(c.elements.textElem, "onkeyup", [function(){this.inputHex(this.elements.textElem.value)}, [], c]); //kind of hacky
if (!swatchElem)
  a = textElem
EH.setEventHandler(a, "onclick", [c.show, [], c]);
},

adjacentElement : function (e, forward) {
do {
  if (forward)
    e = e.nextSibling;
  else
    e = e.previousSibling;
} while (e && e.nodeType != 1);
return e;
},

//---------------------------------------------------
// append css rules
createCSS : function (cssRules) {
var ua = navigator.userAgent.toLowerCase();
var isIE = (/msie/.test(ua)) && !(/opera/.test(ua)) && (/win/.test(ua));

var style_node = document.createElement("style");
style_node.setAttribute("type", "text/css");
style_node.setAttribute("media", "screen");

if (!isIE) { 
	for (var i=0;i<cssRules.length;i++)
    style_node.appendChild(document.createTextNode(cssRules[i].selector + " {" + cssRules[i].declaration + "}"));			
}

document.getElementsByTagName("head")[0].appendChild(style_node);

if (isIE && document.styleSheets && document.styleSheets.length > 0) {
	var last_style_node = document.styleSheets[document.styleSheets.length - 1];
	if (typeof(last_style_node.addRule) == "object"){
    for (var i=0;i<cssRules.length;i++) {
  		var a = cssRules[i].selector.split(",");
  		for (var j=0; j<a.length; j++) {
  			last_style_node.addRule(a[j], cssRules[i].declaration);
      }
    }
  }
}	
},

//--------------------------------------------
//              CSS styles
//--------------------------------------------
kcpCSS : [
{
selector: ".kcp-greet, .kcp-greet h1, .kcp-greet p, .kcp-greet a, .kcp-container div, .kcp-container img, .kcp-container table, .kcp-container td .kcp-container p, .kcp-container a, .kcp-about h1, .kcp-about p, .kcp-about div, .kcp-intro, .kcp-intro h1, .kcp-intro p", //.kcp-container tr?
declaration: "color: black; background-color: transparent; border: 0; font-family: arial; font-weight: normal; font-size: 13px; font-style: normal; text-align: left; text-decoration: none;  text-indent: 0;vertical-align: top; padding: 0; margin: 0;"
},
{
selector: ".kcp-greet",
declaration: "cursor: pointer; z-index: 6000; position: absolute; top: 50px; left: 50px; width: 150px; text-align: center; border: 2px solid lightgreen; background-color: green; color: white;"
},
{
selector: ".kcp-greet h1",
declaration: "color: white; text-align: center; font-size:15px; font-weight: bold; margin: 3px;"
},
{
selector: ".kcp-greet p",
declaration: "color: white; text-align: center; margin:2px;"
},
{
selector: ".kcp-greet a",
declaration: "position: absolute; top:-7px; left:137px; color: darkgreen; font-size:12px; padding: 0px 5px; font-weight:bold; border: 2px solid lightgreen; background: lightgreen;"
},

{
selector: "div.kcp-translucentBG",
declaration: "background-color: #000; filter: alpha(opacity=60); opacity: 0.60; -moz-border-radius: 6px; -webkit-border-radius: 6px;z-index:50000;"
},
{
selector: "div.kcp-container",
declaration: "width: 138px; height:135px;"
},
{
selector: "div.kcp-sliderContainer",
declaration: "width:99px; height:96px; margin-top:-5px; margin-left:32px;"
},
{
selector: "div.kcp-triangleSlider",
declaration: "position: relative; width:99px; height:89px; margin-bottom:11px;"
},
{
selector: "div.kcp-wheelSlider",
declaration: "position:relative; width: 96px; height: 96px;"
},
{
selector: "div.kcp-geoThumb",
declaration: "cursor: pointer; z-index:600; position:absolute; top:36px; left:36px; border:2px solid black; width:15px; height:15px; -moz-border-radius: 9px; -webkit-border-radius: 9px;"
},
{
selector: "* html div.kcp-geoThumb",
declaration: "width: 19px;"
},
{
selector: "div.kcp-barSlider",
declaration: "position:relative; margin-top:5px; margin-left:1px; width:96px; height:15px;"
},
{
selector: "div.kcp-barThumb",
declaration: "cursor: pointer; z-index:600; position:absolute; top:-3px; left:0px; border:2px solid black; width:8px; height:17px; -moz-border-radius: 3px; -webkit-border-radius: 3px;"
},
{
selector: "* html div.kcp-barThumb",
declaration: "width: 12px;"
},
{
selector: "div.kcp-about",
declaration: "color:#fff; text-align: center; font-size:10px; width:96px; padding: 0px;"
},
{
selector: "div.kcp-about p, div.kcp-about a, div.kcp-about h1",
declaration: "text-align: center; color: #fff; font-size: 11px; padding: 0px;"
},
{
selector: "div.kcp-about h1",
declaration: "font-size:13px; font-weight: bold; margin-bottom: 5px;"
},
{
selector: ".kcp-about a:hover",
declaration: "color: #ffe888; text-decoration: underline;"
},
{
selector: "div.kcp-display",
declaration: "position:absolute; top:10px; left:-29px; width:56px; height:56px; border: 2px solid black; -moz-border-radius:8px;  -webkit-border-radius: 6px;"
},
{
selector: "* html div.kcp-display",
declaration: "width: 60px;"
},
{
selector: ".kcp-unselectable",
declaration: "-moz-user-select: none; -khtml-user-select: none; user-select: none;"
},
{
selector: "div.kcs-menu",
declaration: "padding: 0; margin: 0; font-family: arial, helvetica; position: relative; min-height: 4px;"
},
{
selector: "div.kcs-menuTranslucentBG",
declaration: "background-color: #000; filter: alpha(opacity=80); opacity: 0.80; -moz-border-radius: 3px; -webkit-border-radius: 3px; z-index:60001;"
},
{
selector: "div.kcs-menu a",
declaration: "-moz-border-radius: 3px; -webkit-border-radius: 3px; color: #ddd; padding: 2px 6px; display: block; text-align: left; clear: both; text-decoration: none; font-size: 13px; border: 1px solid transparent;"
},
{
selector: "div.kcs-menu  a.current",
declaration: "color: #eee; background: url('"+ColorPicker.chameleonSrc+"/img/rightarrowwhitetiny.png') no-repeat 10%; text-align: center;"
},
{
selector: ".hidden",
declaration: "visibility: hidden;"
},
{
selector: "table.kcp-okcancel",
declaration: "position: absolute; background: transparent url('"+ColorPicker.chameleonSrc+"/img/okcancel.png') no-repeat left top; left:-25px; top:85px; border-collapse: collapse; height: 44px; width: 53px; cursor: pointer; margin: 0; padding: 0; font-size: 13px; font-weight: bold; font-family: arial; text-align: center; color: #ddd;"
},
{
selector: "td.kcp-top",
declaration: "padding: 1px 0 0 0; text-align: center;"
},
{
selector: "td.kcp-bottom",
declaration: "padding: 0 0 4px 0; text-align: center;"
},
{
selector: "td.kcp-optbut-left",
declaration: "background: transparent url('"+ColorPicker.chameleonSrc+"/img/optbutleft.png') no-repeat left top; width: 6px;"
},
{
selector: "td.kcp-optbut-middle",
declaration: "background: transparent url('"+ColorPicker.chameleonSrc+"/img/optbutmiddle.png') repeat left top; width:70px; padding: 0;"
},
{
selector: "td.kcp-optbut-right",
declaration: "background: transparent url('"+ColorPicker.chameleonSrc+"/img/optbutright.png') no-repeat left top; width: 8px;"
},
{
selector: "table.kcp-optbut",
declaration: "position: relative; border-collapse: collapse; height: 20px; cursor: pointer; margin: 0; left:40px; top:-7px;"
},
{
selector: "table.kcp-optbut div",
declaration: "text-align:center; margin: -1px 0 0 0; padding: 0 -8px; width: 80px; font-size: 13px; font-weight: bold; font-family: arial; color: #eee; background: transparent url('http://web.archive.org/web/20101124083638/http://karmatics.com/chameleon/img/downarrowwhitetiny.png') no-repeat right;"
},
{
selector: "table.kcp-optbut img",
declaration: "margin: 0 0 0 2px;"
}
]
};

Chameleon.init();
  
  
  
  
  

/*
     FILE ARCHIVED ON 08:36:38 Nov 24, 2010 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 23:17:19 May 21, 2019.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  LoadShardBlock: 41.26 (3)
  esindex: 0.005
  captures_list: 55.665
  CDXLines.iter: 10.677 (3)
  PetaboxLoader3.datanode: 63.019 (4)
  exclusion.robots: 0.14
  exclusion.robots.policy: 0.13
  RedisCDXSource: 1.543
  PetaboxLoader3.resolve: 24.088
  load_resource: 48.897
*/
