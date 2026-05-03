import '../styles/SkeletonLoader.css';

/**
 * Componente de skeleton loader para estados de carga
 */
function SkeletonLoader({ type = 'card', count = 1 }) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="skeleton-card">
            <div className="skeleton-header">
              <div className="skeleton skeleton-circle"></div>
              <div className="skeleton-text-group">
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-subtitle"></div>
              </div>
            </div>
            <div className="skeleton-body">
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text short"></div>
            </div>
            <div className="skeleton-footer">
              <div className="skeleton skeleton-button"></div>
              <div className="skeleton skeleton-button"></div>
              <div className="skeleton skeleton-button"></div>
            </div>
          </div>
        );
      
      case 'table-row':
        return (
          <div className="skeleton-table-row">
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text short"></div>
            <div className="skeleton skeleton-badge"></div>
          </div>
        );
      
      case 'stat':
        return (
          <div className="skeleton-stat">
            <div className="skeleton skeleton-icon"></div>
            <div className="skeleton-text-group">
              <div className="skeleton skeleton-text short"></div>
              <div className="skeleton skeleton-value"></div>
            </div>
          </div>
        );
      
      default:
        return <div className="skeleton skeleton-text"></div>;
    }
  };

  return (
    <div className="skeleton-container">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </div>
  );
}

export default SkeletonLoader;
