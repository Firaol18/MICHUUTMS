import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@tms/shared/components/common/Card';
import { Button } from '@tms/shared/components/common/Button';
import { useWishlistStore } from '@tms/shared/store/useWishlistStore';
import { Heart } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist } = useWishlistStore();

  return (
    <div>
      <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
        ❤️ Wishlist
      </h2>

      {wishlist.length === 0 ? (
        <Card glass style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Heart size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto' }} />
          <h3>Your wishlist is empty</h3>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Click the heart icon on any tour card to save it to your personal favorites!
          </p>
          <Button variant="primary" onClick={() => navigate('/tours')}>
            Browse Tour Packages
          </Button>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {wishlist.map((tour) => (
            <Card key={tour.id} glass style={{ padding: 0, overflow: 'hidden' }}>
              <div
                style={{
                  height: 180,
                  backgroundImage: `url(${tour.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                }}
              >
                <button
                  onClick={() => toggleWishlist(tour)}
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Remove from wishlist"
                >
                  <Heart size={16} fill="#ef4444" />
                </button>
              </div>
              <div style={{ padding: '1.25rem' }}>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--brand-primary)', fontWeight: 600, marginBottom: '0.2rem' }}>
                  📍 {tour.destination.name}
                </div>
                <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: '0.5rem' }}>{tour.title}</h3>
                <div className="flex-between" style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: 'var(--text-primary)' }}>
                    ${tour.pricePerPerson} USD
                  </span>
                  <Button variant="primary" size="sm" onClick={() => navigate(`/tours/${tour.id}`)}>
                    Book Tour
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
