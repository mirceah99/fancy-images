window.addEventListener("load", function () {
	const canvas = document.getElementById("main-canvas");
	canvas.width = Math.floor(canvas.offsetWidth);
	canvas.height = Math.floor(canvas.offsetHeight);
	const ctx = canvas.getContext("2d");
	const image = this.document.getElementById("sample-img");
	class Particle {
		constructor(effect, x, y, color) {
			this.effect = effect;
			this.color = color;
			this.originX = Math.floor(x);
			this.originY = Math.floor(y);
			this.x = Math.floor(Math.random() * effect.width);
			this.y = Math.floor(Math.random() * effect.height);
			this.size = this.effect.pxSize;
			// const rand = Math.random()*2
			this.vx = 0;
			this.vy = 0;
			this.ease = 0.2 * Math.random() + 0.06;
			this.distance = 0;
			this.angle = 0;
			this.dy = 0;
			this.dx = 0;
			this.force = 0;
			this.friction = 0.95;
		}
		draw(context) {
			context.fillStyle = this.color;
			context.fillRect(this.x, this.y, this.size, this.size);
		}
		update() {
			this.dx = this.effect.mouse.x - this.x;
			this.dy = this.effect.mouse.y - this.y;
			this.distance = this.dx * this.dx + this.dy * this.dy;
			this.force = -this.effect.mouse.radius / this.distance;
			if (this.distance < this.effect.mouse.radius) {
				this.angle = Math.atan2(this.dy, this.dx);
				this.vx += this.force * Math.cos(this.angle);
				this.vy += this.force * Math.sin(this.angle);
			}
			this.x +=
				(this.vx *= this.friction) + (this.originX - this.x) * this.ease;
			this.y +=
				(this.vy *= this.friction) + (this.originY - this.y) * this.ease;
		}
	}
	class Effect {
		constructor(width, height, image, ctx) {
			this.width = width;
			this.height = height;
			this.image = image;
			this.particles = [];
			this.ctx = ctx;
			this.pxSize = null;
			this.maxNumberOfParticles = 50000;
			this.drawImageScaled(image, ctx);
			this.mouse = {
				radius: 3000,
				x: null,
				y: null,
			};
			if (touchOn) {
				window.addEventListener("touchmove", (event) => {
					console.log(event);
					this.mouse.x = event.touches.item(0).clientX;
					this.mouse.y = event.touches.item(0).clientY;
				});
			} else {
				window.addEventListener("mousemove", (event) => {
					this.mouse.x = event.x;
					this.mouse.y = event.y;
				});
			}
		}
		init() {
			const pixels = ctx.getImageData(0, 0, this.width, this.height).data;
			this.pxSize = Math.floor(pixels.length / (this.maxNumberOfParticles * 4));
			this.pxSize = 3;
			for (let y = 0; y < this.height; y += this.pxSize) {
				for (let x = 0; x < this.width; x += this.pxSize) {
					const index = y * this.width * 4 + x * 4;
					const alpha = pixels[index + 3];
					if (alpha === 0) continue;
					const red = pixels[index];
					const green = pixels[index + 1];
					const blue = pixels[index + 2];
					const color = `rgb(${red},${green},${blue})`;
					this.particles.push(new Particle(this, x, y, color));
				}
			}
		}
		draw() {
			this.particles.forEach((particle) => {
				particle.draw(this.ctx);
			});
		}
		update() {
			this.particles.forEach((particle) => particle.update());
		}
		drawImageScaled(img, ctx) {
			var canvas = ctx.canvas;
			var hRatio = canvas.width / img.width;
			var vRatio = canvas.height / img.height;
			var ratio = Math.min(hRatio, vRatio);
			var centerShift_x = (canvas.width - img.width * ratio) / 2;
			var centerShift_y = (canvas.height - img.height * ratio) / 2;
			ctx.drawImage(
				img,
				0,
				0,
				img.width,
				img.height,
				centerShift_x,
				centerShift_y,
				img.width * ratio,
				img.height * ratio
			);
		}
	}
	const touchOn =
		"ontouchstart" in window ||
		navigator.maxTouchPoints > 0 ||
		navigator.msMaxTouchPoints > 0;

	const effect = new Effect(canvas.width, canvas.height, image, ctx, touchOn);
	effect.init();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	effect.draw();
	(function animate() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		effect.draw();
		effect.update();
		window.requestAnimationFrame(animate);
	})();
});
