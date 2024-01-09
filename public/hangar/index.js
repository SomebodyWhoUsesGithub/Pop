const socket = io()
console.log("Welcome to the hangar anon");
console.log(socket)
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const devicePixelRatio = window.devicePixelRatio || 1
canvas.width = 1920 * devicePixelRatio
canvas.height = 1080 * devicePixelRatio
c.scale(devicePixelRatio, devicePixelRatio)
const loader = new THREE.TextureLoader()
const cross = loader.load('./cross.png')
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(new THREE.Color('#555555'), 0.15)
document.body.appendChild(renderer.domElement);

const particlesGeometry = new THREE.BufferGeometry;
const particlesCnt = 50000;
const posArray = new Float32Array(particlesCnt * 3);
for (let i = 0; i < particlesCnt; i++) {
    posArray[i] = (Math.random() - 0.5)  * 10;
    // posArray[i] = (Math.random() - 0.5) *(Math.random() * 25);
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
const material = new THREE.PointsMaterial({
    size: 0.003,
    // map: cross,
    transparent: true,
    color: 'red'
    // blending: THREE.AdditiveBlending
})
const particlesMesh = new THREE.Points(particlesGeometry, material)
scene.add(particlesMesh)
// const pointLight = new THREE.PointLight(0xffffff, 0.1)
// pointLight.position.x = 2
// pointLight.position.y = 3
// pointLight.position.z = 4
// scene.add(pointLight)
// const geometry = new THREE.BoxGeometry(1, 1, 1);
// const materialC = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// const cube = new THREE.Mesh(geometry, materialC);
// scene.add(cube);

camera.position.z = 5;
document.addEventListener('mousemove', animateParticles)
let mouseX = 0
let mouseY = 0
function animateParticles(event) {
    mouseX = event.clientX
    mouseY = event.clientY
}
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    particlesMesh.rotation.y = -.1 * elapsedTime
    if (mouseX > 0) {
        particlesMesh.rotation.x = mouseY * (elapsedTime * 0.00005)
        particlesMesh.rotation.y = mouseX * (elapsedTime * 0.00005)
    }
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
}
tick()
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);   
}
window.addEventListener('resize', onWindowResize, false);



