import React from 'react';
import { GoldLocation } from '../services/openai/search/goldLocations';

interface RiverCardProps {
  river: GoldLocation;
  onDetailsClick: (river: GoldLocation) => void;
}

const RiverCard: React.FC<RiverCardProps> = ({ river, onDetailsClick }) => {
  // Fonction pour afficher les étoiles de notation
  const renderRating = (rating: number) => {
    return '⭐'.repeat(Math.min(5, Math.max(1, Math.round(rating))));
  };

  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.5)',
      borderRadius: '10px',
      padding: '1rem',
      marginBottom: '1rem',
      border: '1px solid rgba(255, 215, 0, 0.3)'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '0.5rem'
      }}>
        <h3 style={{ margin: 0, color: '#ffd700' }}>
          {river.name} 
          <span style={{ 
            fontSize: '0.8rem', 
            backgroundColor: 'rgba(255, 215, 0, 0.2)',
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            marginLeft: '0.5rem',
            color: 'white'
          }}>
            {river.type}
          </span>
        </h3>
        <div style={{ color: '#ffd700' }}>{renderRating(river.rating)}</div>
      </div>
      
      <p style={{ 
        margin: '0.5rem 0', 
        fontSize: '0.9rem',
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: '1.4'
      }}>
        {river.description.length > 150 
          ? `${river.description.substring(0, 150)}...` 
          : river.description}
      </p>
      
      {river.hotspots && river.hotspots.length > 0 && (
        <div style={{ 
          margin: '0.8rem 0',
          padding: '0.5rem',
          backgroundColor: 'rgba(255, 215, 0, 0.1)',
          borderRadius: '6px'
        }}>
          <div style={{ 
            fontSize: '0.85rem', 
            color: '#ffd700',
            marginBottom: '0.3rem',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ marginRight: '0.3rem' }}>📍</span> Points d'intérêt: {river.hotspots.length}
          </div>
          <div style={{ 
            fontSize: '0.8rem', 
            color: 'rgba(255, 255, 255, 0.7)',
            fontStyle: 'italic'
          }}>
            {river.hotspots.map(h => h.location).join(', ')}
          </div>
        </div>
      )}
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginTop: '1rem',
        alignItems: 'center'
      }}>
        <div style={{ 
          fontSize: '0.8rem', 
          color: 'rgba(255, 255, 255, 0.6)'
        }}>
          Coordonnées: {river.coordinates[0].toFixed(4)}, {river.coordinates[1].toFixed(4)}
        </div>
        
        <button 
          onClick={() => onDetailsClick(river)}
          style={{
            background: '#ffd700',
            color: '#000',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.8rem'
          }}
        >
          En savoir plus
        </button>
      </div>
    </div>
  );
};

export default RiverCard;
