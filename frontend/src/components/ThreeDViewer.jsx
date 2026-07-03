"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

export default function ThreeDViewer({
  fileUrl,
  fileBuffer,
  className = "",
  autoRotate = true,
}) {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;
    const width = currentMount.clientWidth || 300;
    const height = currentMount.clientHeight || 300;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 120);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2);
    dirLight1.position.set(1, 1, 1).normalize();
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x7c3aed, 1.5);
    dirLight2.position.set(-1, -1, 1).normalize();
    scene.add(dirLight2);

    const dirLight3 = new THREE.DirectionalLight(0x06b6d4, 1.5);
    dirLight3.position.set(0, 50, 0);
    scene.add(dirLight3);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2;

    const gridHelper = new THREE.GridHelper(100, 20, 0x7c3aed, 0x1e293b);
    gridHelper.position.y = -30;
    scene.add(gridHelper);

    let mesh = null;
    const loader = new STLLoader();

    const configureGeometry = (geometry) => {
      geometry.center();
      geometry.computeVertexNormals();
      geometry.computeBoundingSphere();

      const sphere = geometry.boundingSphere;
      if (sphere) {
        const radius = sphere.radius;
        const scaleFactor = 35 / radius;
        geometry.scale(scaleFactor, scaleFactor, scaleFactor);
      }

      const material = new THREE.MeshStandardMaterial({
        color: 0xa855f7,
        roughness: 0.2,
        metalness: 0.8,
        wireframe: false,
      });

      mesh = new THREE.Mesh(geometry, material);
      mesh.position.y = -10;
      scene.add(mesh);
    };

    if (fileUrl) {
      setTimeout(() => {
        setLoading(true);
        setError(null);
      }, 0);
      loader.load(
        fileUrl,
        (geometry) => {
          configureGeometry(geometry);
          setLoading(false);
        },
        undefined,
        (err) => {
          console.warn(
            "STLLoader failed to fetch, loading torus knot fallback.",
          );
          loadFallbackMesh();
          setLoading(false);
        },
      );
    } else if (fileBuffer) {
      try {
        const geometry = loader.parse(fileBuffer);
        configureGeometry(geometry);
      } catch (err) {
        loadFallbackMesh();
      }
    } else {
      loadFallbackMesh();
    }

    function loadFallbackMesh() {
      const geometry = new THREE.TorusKnotGeometry(15, 4, 100, 16);
      const material = new THREE.MeshStandardMaterial({
        color: 0x7c3aed,
        roughness: 0.3,
        metalness: 0.7,
        wireframe: true,
      });
      mesh = new THREE.Mesh(geometry, material);
      mesh.position.y = 0;
      scene.add(mesh);
    }

    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (mesh && autoRotate) {
        mesh.rotation.y += 0.006;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!currentMount) return;
      const w = currentMount.clientWidth;
      const h = currentMount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      scene.clear();
      renderer.dispose();
    };
  }, [fileUrl, fileBuffer, autoRotate]);

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-white/10 bg-slate-950/80 ${className}`}
    >
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/90 text-white">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <span className="mt-4 text-sm font-light text-slate-400">
            Analyzing 3D mesh structure...
          </span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/90 text-red-400 px-4 text-center">
          <p>{error}</p>
        </div>
      )}
      <div ref={mountRef} className="w-full h-full min-h-[300px]" />
      <div className="absolute bottom-3 right-3 flex gap-2">
        <span className="rounded bg-black/60 px-2 py-1 text-[10px] uppercase tracking-wider text-slate-300 backdrop-blur">
          Drag to Rotate
        </span>
        <span className="rounded bg-black/60 px-2 py-1 text-[10px] uppercase tracking-wider text-slate-300 backdrop-blur">
          Scroll to Zoom
        </span>
      </div>
    </div>
  );
}
