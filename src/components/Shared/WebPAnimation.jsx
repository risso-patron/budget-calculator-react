import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente para animaciones WebP
 * Más ligero y simple que Lottie - ideal para iconos animados
 */
const WebPAnimation = ({ 
  src, 
  alt, 
  size = 'md',
  className = '',
  style = {},
  onLoad,
  onError,
  priority = false
}) => {
  // Tamaños predefinidos
  const sizeClasses = {
    xs: 'w-8 h-8',
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
    '2xl': 'w-40 h-40',
    '3xl': 'w-48 h-48'
  };

  const sizeClass = sizeClasses[size] || size;

  return (
    <img
      src={src}
      alt={alt}
      className={`object-contain ${sizeClass} ${className}`}
      style={style}
      onLoad={onLoad}
      onError={onError}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
};

WebPAnimation.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  size: PropTypes.oneOfType([
    PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']),
    PropTypes.string
  ]),
  className: PropTypes.string,
  style: PropTypes.object,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  priority: PropTypes.bool
};

// ==========================================
// COMPONENTES ESPECIALIZADOS
// ==========================================

/**
 * Lluvia de dinero - Balance positivo
 */
export const MoneyRainWebP = ({ size = 'lg', className = '' }) => (
  <WebPAnimation
    src="/animations/money-rain.webp"
    alt="Lluvia de dinero"
    size={size}
    className={className}
  />
);

/**
 * Fuego - Racha de días activos
 */
export const FireWebP = ({ size = 'md', className = '' }) => (
  <WebPAnimation
    src="/animations/fire.webp"
    alt="Fuego de racha"
    size={size}
    className={className}
  />
);

/**
 * Homer con dinero - Ingresos
 */
export const HomerMoneyWebP = ({ size = 'xl', className = '' }) => (
  <WebPAnimation
    src="/animations/Homer.webp"
    alt="Homer Simpson con dinero"
    size={size}
    className={className}
  />
);

/**
 * Monedas - Ingreso agregado
 */
export const CoinsWebP = ({ size = 'md', className = '' }) => (
  <WebPAnimation
    src="/animations/coins.webp"
    alt="Monedas de oro"
    size={size}
    className={className}
  />
);

/**
 * Dona Simpson - Loading / Categoría Alimentación
 */
export const DonutWebP = ({ size = 'lg', className = '' }) => (
  <WebPAnimation
    src="/animations/donut.webp"
    alt="Dona de Homer Simpson"
    size={size}
    className={className}
    priority={true} // Icónico - cargar primero
  />
);

/**
 * Casa Simpson - Categoría Vivienda
 */
export const HouseWebP = ({ size = 'lg', className = '' }) => (
  <WebPAnimation
    src="/animations/house.webp"
    alt="Casa de los Simpson"
    size={size}
    className={className}
  />
);

/**
 * Cohete - Nueva meta
 */
export const RocketWebP = ({ size = 'lg', className = '' }) => (
  <WebPAnimation
    src="/animations/Rocket.webp"
    alt="Cohete despegando"
    size={size}
    className={className}
  />
);

/**
 * Auto rosa - Transporte
 */
export const TransportWebP = ({ size = 'lg', className = '' }) => (
  <WebPAnimation
    src="/animations/transport.webp"
    alt="Auto de los Simpson"
    size={size}
    className={className}
  />
);

/**
 * TV - Entretenimiento
 */
export const EntertainmentWebP = ({ size = 'lg', className = '' }) => (
  <WebPAnimation
    src="/animations/entertainment.webp"
    alt="Televisión"
    size={size}
    className={className}
  />
);

/**
 * Ingresos - Icono general
 */
export const IncomeWebP = ({ size = 'lg', className = '' }) => (
  <WebPAnimation
    src="/animations/income.webp"
    alt="Dinero ingresos"
    size={size}
    className={className}
  />
);

/**
 * Trophy - Para logros y celebraciones
 */
export const TrophyWebP = ({ size = 'lg', className = '' }) => (
  <WebPAnimation
    src="/animations/income.webp"
    alt="Trophy"
    size={size}
    className={`${className} filter hue-rotate-60`}
  />
);

// ==========================================
// CONTENEDORES CON EFECTOS
// ==========================================

/**
 * Animación con efecto de entrada
 */
export const WebPWithEntrance = ({ 
  src, 
  alt, 
  size = 'md',
  entrance = 'fade-in',
  delay = 0 
}) => {
  const entranceEffects = {
    'fade-in': 'animate-fadeIn',
    'scale-in': 'animate-scaleIn',
    'bounce-in': 'animate-bounceIn',
    'slide-up': 'animate-slideUp'
  };

  return (
    <div 
      className={entranceEffects[entrance]}
      style={{ animationDelay: `${delay}ms` }}
    >
      <WebPAnimation src={src} alt={alt} size={size} />
    </div>
  );
};

/**
 * Animación con hover effect
 */
export const WebPWithHover = ({ 
  src, 
  alt, 
  size = 'md',
  hoverEffect = 'scale'
}) => {
  const hoverEffects = {
    scale: 'hover:scale-110',
    rotate: 'hover:rotate-12',
    bounce: 'hover:animate-bounce',
    pulse: 'hover:animate-pulse'
  };

  return (
    <div className="transition-transform duration-300">
      <WebPAnimation
        src={src}
        alt={alt}
        size={size}
        className={hoverEffects[hoverEffect]}
      />
    </div>
  );
};

/**
 * Animación con glow effect (estilo Simpson)
 */
export const WebPWithGlow = ({ 
  src, 
  alt, 
  size = 'md',
  glowColor = 'yellow'
}) => {
  const glowColors = {
    yellow: 'drop-shadow-[0_0_15px_rgba(254,217,15,0.7)]',
    pink: 'drop-shadow-[0_0_15px_rgba(255,182,193,0.7)]',
    blue: 'drop-shadow-[0_0_15px_rgba(21,101,192,0.7)]',
    green: 'drop-shadow-[0_0_15px_rgba(76,175,80,0.7)]'
  };

  return (
    <div className={`filter ${glowColors[glowColor]}`}>
      <WebPAnimation src={src} alt={alt} size={size} />
    </div>
  );
};

// ==========================================
// COMPONENTE CON FALLBACK
// ==========================================

/**
 * WebP con fallback a emoji si falla
 */
export const WebPWithFallback = ({ 
  src, 
  alt, 
  emoji = '💰',
  size = 'md' 
}) => {
  const [error, setError] = React.useState(false);

  if (error) {
    const sizeClasses = {
      xs: 'text-2xl',
      sm: 'text-3xl',
      md: 'text-4xl',
      lg: 'text-6xl',
      xl: 'text-8xl',
      '2xl': 'text-9xl'
    };

    return (
      <span className={sizeClasses[size]} role="img" aria-label={alt}>
        {emoji}
      </span>
    );
  }

  return (
    <WebPAnimation
      src={src}
      alt={alt}
      size={size}
      onError={() => setError(true)}
    />
  );
};

export default WebPAnimation;
