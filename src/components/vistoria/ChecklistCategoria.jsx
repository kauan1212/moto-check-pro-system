import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ChecklistItem from '@/components/vistoria/ChecklistItem';

const ChecklistCategoria = ({ categoria, items, vistoriaData, onChecklistChange, onPhotoAdd, onPhotoRemove, animationDelay }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay: animationDelay }}
  >
    <Card className="mb-6 card-shadow">
      <CardHeader>
        <CardTitle className="text-xl text-purple-700">
          {categoria}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-4 ${categoria === 'Fotos Gerais da Moto' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
          {items.map(item => (
            <ChecklistItem
              key={item.id}
              item={item}
              vistoriaData={vistoriaData}
              onChecklistChange={onChecklistChange}
              onPhotoAdd={onPhotoAdd}
              onPhotoRemove={onPhotoRemove}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default ChecklistCategoria;