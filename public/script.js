(function () {
    window.requestAnimFrame = (function () {
        return (
            window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimaitonFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            }
        );
    })();

    const canvas = document.getElementById("sigCanvas");
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#222222";
    ctx.lineWidth = 2;

    let drawing = false;
    let mousePos = {
        x: 0,
        y: 0,
    };
    let lastPos = mousePos;

    canvas.addEventListener(
        "mousedown",
        function (e) {
            drawing = true;
            lastPos = getMousePos(canvas, e);
        },
        false
    );

    // const submitBtn = document.getElementById("submit");
    const sigText = $("#sig-text");

    canvas.addEventListener(
        "mouseup",
        function () {
            let dataUrl = canvas.toDataURL();
            console.log(dataUrl);
            sigText.val(dataUrl);

            drawing = false;
        },
        false
    );

    canvas.addEventListener(
        "mousemove",
        function (e) {
            mousePos = getMousePos(canvas, e);
        },
        false
    );

    // Add touch event support for mobile
    // canvas.addEventListener("touchstart", function (e) {}, false);

    canvas.addEventListener(
        "touchmove",
        { passive: true },
        function (e) {
            let touch = e.touches[0];
            let me = new MouseEvent("mousemove", {
                clientX: touch.clientX,
                clientY: touch.clientY,
            });
            canvas.dispatchEvent(me);
        },
        false
    );

    canvas.addEventListener("touchstart", { passive: true }, function (e) {
        mousePos = getTouchPos(canvas, e);
        var touch = e.touches[0];
        var me = new MouseEvent("mousedown", {
            clientX: touch.clientX,
            clientY: touch.clientY,
        });
        canvas.dispatchEvent(me);
    });

    canvas.addEventListener(
        "touchend",
        { passive: true },
        function () {
            var me = new MouseEvent("mouseup", {});
            canvas.dispatchEvent(me);
        },
        false
    );

    function getMousePos(canvasDom, mouseEvent) {
        var rect = canvasDom.getBoundingClientRect();
        return {
            x: mouseEvent.clientX - rect.left,
            y: mouseEvent.clientY - rect.top,
        };
    }

    function getTouchPos(canvasDom, touchEvent) {
        var rect = canvasDom.getBoundingClientRect();
        return {
            x: touchEvent.touches[0].clientX - rect.left,
            y: touchEvent.touches[0].clientY - rect.top,
        };
    }

    function renderCanvas() {
        if (drawing) {
            ctx.moveTo(lastPos.x, lastPos.y);
            ctx.lineTo(mousePos.x, mousePos.y);
            ctx.stroke();
            lastPos = mousePos;
        }
    }

    // Prevent scrolling when touching the canvas
    document.body.addEventListener(
        "touchstart",
        { passive: true },
        function (e) {
            if (e.target == canvas) {
                e.preventDefault();
            }
        },
        false
    );
    document.body.addEventListener(
        "touchend",
        { passive: true },
        function (e) {
            if (e.target == canvas) {
                e.preventDefault();
            }
        },
        false
    );
    document.body.addEventListener(
        "touchmove",
        { passive: true },
        function (e) {
            if (e.target == canvas) {
                e.preventDefault();
            }
        },
        false
    );

    (function drawLoop() {
        requestAnimationFrame(drawLoop);
        renderCanvas();
    })();

    // submitBtn.addEventListener(
    //     "submit",
    //     function () {
    //         // var dataUrl = canvas.toDataURL();
    //         // sigText.innerHTML = dataUrl;
    //         // console.log(dataUrl);
    //         console.log("clicked");
    //         // sigImage.setAttribute("src", dataUrl);
    //     },
    //     false
    // );

})();
