import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Float, Stars, useGLTF } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';
import * as THREE from 'three';

// Floating 404 Text Component
function Floating404() {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={0.5}>
      <Text
        fontSize={5}
        color="#6366f1"
        anchorX="center"
        anchorY="middle"
        position={[0, 2, 0]}
        font="/fonts/Inter-Bold.woff"
      >
        404
      </Text>
      <Text
        fontSize={1.5}
        color="#64748b"
        anchorX="center"
        anchorY="middle"
        position={[0, 0, 0]}
        font="/fonts/Inter-Regular.woff"
      >
        Page Not Found
      </Text>
    </Float>
  );
}

// Animated Geometric Shapes
function FloatingShapes() {
  const shapes = useRef<THREE.Group>(null);
  
  return (
    <group ref={shapes}>
      <Float speed={1.5} rotationIntensity={2} floatIntensity={1}>
        <mesh position={[-3, 1, 0]}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color="#8b5cf6" />
        </mesh>
      </Float>
      
      <Float speed={2} rotationIntensity={1.5} floatIntensity={0.8}>
        <mesh position={[3, -1, 0]}>
          <sphereGeometry args={[0.6]} />
          <meshStandardMaterial color="#06b6d4" />
        </mesh>
      </Float>
      
      <Float speed={1.8} rotationIntensity={1} floatIntensity={1.2}>
        <mesh position={[0, -2, -2]}>
          <octahedronGeometry args={[0.7]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
      </Float>
      
      <Float speed={1.3} rotationIntensity={2.5} floatIntensity={0.6}>
        <mesh position={[-2, -1, 2]}>
          <tetrahedronGeometry args={[0.8]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
      </Float>
    </group>
  );
}

// Scene Component
function Scene() {
  return (
    <>
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#6366f1" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
      
      <Floating404 />
      <FloatingShapes />
    </>
  );
}

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.1),transparent_50%)]" />
      
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center space-y-6 backdrop-blur-sm bg-background/80 p-8 rounded-2xl border shadow-2xl max-w-md w-full">
          <div className="space-y-2">
            <p className="text-lg text-muted-foreground">
              Oops! The page you're looking for doesn't exist.
            </p>
            <p className="text-sm text-muted-foreground">
              But don't worry, you can explore our amazing products instead!
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="flex items-center gap-2">
              <Link to="/">
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="flex items-center gap-2">
              <Link to="/products">
                <ArrowLeft className="h-4 w-4" />
                Browse Products
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent/20 rounded-full blur-xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 right-20 w-16 h-16 bg-secondary/20 rounded-full blur-xl animate-pulse delay-500" />
    </div>
  );
};

export default NotFound;