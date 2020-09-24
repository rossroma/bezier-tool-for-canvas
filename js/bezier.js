(function(){
	// 准备画布
	var clickPoint=null,sourcePoint,isQuadratic = false,
	canvas=document.getElementById("canvas"),
	code=document.getElementById("code"),
	ctx=canvas.getContext("2d"),
	point={p1:{x:150,y:250},p2:{x:450,y:250},cp1:{x:300,y:100}},
	history=[],
	temp=[],
	isLink=false, // 是否绘制连续的图像
	cp2={x:400,y:100},
	round={
		curve:{width:2,color:"#1572b5"},
		cpline:{width:0.5,color:"#cf4520"},
		point:{
			radius:10,
			width:1,
			color:"#009696",
			fill:"rgba(0,170,187,0.6)"
		}
	};

	init();

	function init(){
		point={p1:{x:point.p1.x,y:point.p1.y},p2:{x:point.p2.x,y:point.p2.y},cp1:{x:point.cp1.x,y:point.cp1.y}};
		if(isQuadratic){
			point.cp2=cp2;
		}
		ctx.lineCap="round";
		ctx.lineJoin="round";
		canvas.onmousedown=mouseDownFun;
		canvas.onmousemove=mouseMoveFun;
		canvas.onmouseup=canvas.onmouseout=mouseUpFun;
		drawCanvas()
	}
	//绘制
	function drawCanvas(){
		ctx.clearRect(0,0,canvas.width,canvas.height);
		drawUploadImg()
		drawMatrix(ctx);
		ctx.beginPath();
		ctx.lineWidth=round.cpline.width;
		ctx.strokeStyle=round.cpline.color;
		ctx.beginPath();
		ctx.moveTo(point.p1.x,point.p1.y);
		ctx.lineTo(point.cp1.x,point.cp1.y);
		if(isQuadratic){
			ctx.moveTo(point.p2.x,point.p2.y);
			ctx.lineTo(point.cp2.x,point.cp2.y)
		}else{
			ctx.lineTo(point.p2.x,point.p2.y)
		}
		ctx.stroke();
		ctx.lineWidth=round.curve.width;
		ctx.strokeStyle=round.curve.color;
		ctx.beginPath();
		drawHistory(ctx);
		if(isQuadratic){
			ctx.bezierCurveTo(point.cp1.x,point.cp1.y,point.cp2.x,point.cp2.y,point.p2.x,point.p2.y)
			temp = [point.p1.x,point.p1.y, point.cp1.x,point.cp1.y,point.cp2.x,point.cp2.y,point.p2.x,point.p2.y]
		}else{
			ctx.quadraticCurveTo(point.cp1.x,point.cp1.y,point.p2.x,point.p2.y)
			temp = [point.p1.x,point.p1.y, point.cp1.x,point.cp1.y,point.p2.x,point.p2.y]
		}
		ctx.stroke();
		for(var v in point){
			ctx.lineWidth=round.point.width;
			ctx.strokeStyle=round.point.color;
			ctx.fillStyle=round.point.fill;
			ctx.beginPath();
			ctx.arc(point[v].x,point[v].y,round.point.radius,0,2*Math.PI,true);
			ctx.fill();
			ctx.stroke()
		}
		appendText()
	}
	//插入对应文字到提示框
	function appendText(){
		var codeHTML=appendHistoryText();
		if(point.cp2){
			codeHTML+="ctx.bezierCurveTo("+point.cp1.x+", "+point.cp1.y+", "+point.cp2.x+", "+point.cp2.y+", "+point.p2.x+", "+point.p2.y+");\n"
		}else{
			codeHTML+="ctx.quadraticCurveTo("+point.cp1.x+", "+point.cp1.y+", "+point.p2.x+", "+point.p2.y+");\n"
		}

		code.innerHTML='canvas = document.getElementById("canvas");\n';
		code.innerHTML+='ctx = canvas.getContext("2d")\n';
		code.innerHTML+='ctx.strokeStyle = "'+round.curve.color+'";\n';
		code.innerHTML+='ctx.lineWidth = '+round.curve.width+';\n';
		code.innerHTML+='ctx.beginPath();\n';
		code.innerHTML+=codeHTML;
		code.innerHTML+="ctx.stroke();\n";
		code.innerHTML+="ctx.closePath();\n";
	}
	function mouseDownFun(e){
		e=getPoint(e);
		var dx,dy;
		for(var v in point){
			dx=point[v].x-e.x;
			dy=point[v].y-e.y;
			//判断点击区域是否在可见圆内
			if(Math.pow(dx,2)+Math.pow(dy,2)<Math.pow(round.point.radius,2)){
				clickPoint=v;
				sourcePoint=e;
				canvas.style.cursor="move";
				return
			}
		}
	}
	function mouseMoveFun(e){
		if(clickPoint){
			e=getPoint(e);
			point[clickPoint].x+=e.x-sourcePoint.x;
			point[clickPoint].y+=e.y-sourcePoint.y;
			sourcePoint=e;
			drawCanvas()
		}
	}
	function mouseUpFun(e){
		clickPoint=null;
		canvas.style.cursor="default";
		drawCanvas()
	}
	function getPoint(e){
		e=(e?e:window.event);
		return{x:e.pageX-canvas.offsetLeft,y:e.pageY-canvas.offsetTop}
	}
	function drawUploadImg(){
		var img=document.getElementById("imghead");
		if(img.src!=''){
			ctx.drawImage(img, 0, 0)
		}
	}

	function drawMatrix (ctx) {
		for (var i = 0; i < 25; i++) {
			for (var j = 0; j < 25; j++) {
				ctx.save();
				ctx.beginPath();
				ctx.lineWidth = 0.2;
				ctx.strokeStyle = '#ccc';
				ctx.translate(j * 25, i * 25);
				ctx.strokeRect(0, 0, 25, 25);
				ctx.restore();
			}
		}
	}

	function drawHistory(ctx){
		if (isLink && history.length) {
			const lastIndex = history.length - 1;
			const lastItem = history[lastIndex].slice(-2);
			if (point.p1.x !== lastItem[0] || point.p1.y !== lastItem[1]) {
				const itemLen = history[lastIndex].length
				console.log('isLink', itemLen)
				
				history[lastIndex][itemLen - 2] = point.p1.x;
				history[lastIndex][itemLen - 1] = point.p1.y;
			}
		}

		let lastP2 = null
		for (let item of history) {
			// 将上一次的结束坐标与这一次的开始坐标进行对比，如果相同，则不需要写moveTo
			if (!lastP2 || lastP2[0] !== item[0] || lastP2[1] !== item[1]) {
				ctx.moveTo(item[0],item[1]);
			}
			lastP2 = item.slice(-2);

			if (item.length === 8) {
				ctx.bezierCurveTo(...item.slice(2))
			} else {
				ctx.quadraticCurveTo(...item.slice(2))
			}
		}
		ctx.moveTo(point.p1.x,point.p1.y)
	}

	function saveSnapshot() {
		history.push(temp);
		[point.p1, point.p2] = [point.p2, point.p1];
		if (point.cp2) {
			console.log(point.cp2);
			[point.cp1, point.cp2] = [point.cp2, point.cp1];
		}
		// console.log(history)
	}

	function appendHistoryText() {
		let html = ''
		let lastP2 = null
		for (let item of history) {
			// 将上一次的结束坐标与这一次的开始坐标进行对比，如果相同，则不需要写moveTo
			if (!lastP2 || lastP2[0] !== item[0] || lastP2[1] !== item[1]) {
				html += `ctx.moveTo(${item[0]}, ${item[1]});\n`
			}
			lastP2 = item.slice(-2);

			if (item.length === 8) {
				html += `ctx.bezierCurveTo(${item.slice(2).join(', ')});\n`
			} else {
				html += `ctx.quadraticCurveTo(${item.slice(2).join(', ')});\n`
			}
		}
		html += `ctx.moveTo(${point.p1.x}, ${point.p1.y});\n`
		return html
	}
	
	document.getElementById("bezierCurveTo").onclick=function(){
		if(isQuadratic){
			isQuadratic = false
			this.innerHTML="bezierCurveTo";
			oldCP2=point.cp2;
			init()
		}else{
			isQuadratic = true
			this.innerHTML="quadraticCurveTo";
			init()
		}
	}
	document.getElementById('file').onchange=function(){
		previewImage(this)
		drawCanvas()
	}
	document.getElementById('exchange').onclick=function(){
		eval("point.p1.x="+point.p2.x+",point.p1.y="+point.p2.y+",point.p2.x="+point.p1.x+",point.p2.y="+point.p1.y)
		drawCanvas()
	}
	document.getElementById('strokeStyle').onchange=function(){
		round.curve.color=this.value
		drawCanvas()
	}
	document.getElementById('lineWidth').onchange=function(){
		round.curve.width=this.value
		drawCanvas()
	}
	document.getElementById('next').onclick=function(){
		saveSnapshot()
	}
	document.getElementById('link').onchange=function(){
		console.log(this.checked)
		isLink = this.checked;
	}
})();