import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PenTool } from 'lucide-react';

const SignatureCanvas = ({ onSignature, signature }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Se já existe uma assinatura, desenha ela no canvas
    if (signature) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = signature;
    }
  }, [signature]);

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const getTouchPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.touches[0].clientX - rect.left) * scaleX,
      y: (e.touches[0].clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const pos = e.type.includes('mouse') ? getMousePos(e) : getTouchPos(e);
    setLastPosition(pos);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = e.type.includes('mouse') ? getMousePos(e) : getTouchPos(e);

    ctx.beginPath();
    ctx.moveTo(lastPosition.x, lastPosition.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    setLastPosition(pos);
  };

  const stopDrawing = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    // Salva a assinatura como base64
    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL();
    onSignature(signatureData);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onSignature(null);
  };

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        className="signature-canvas w-full border-2 border-dashed border-gray-300 rounded-lg bg-white"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        style={{ touchAction: 'none' }}
      />
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center">
          <PenTool className="h-4 w-4 mr-1" />
          <span>Assine aqui</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={clearCanvas}
          type="button"
        >
          Limpar
        </Button>
      </div>
    </div>
  );
};

export default SignatureCanvas;