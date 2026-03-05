import { motion } from 'framer-motion'

/**
 * BudgetLogo — Logo animado para Budget Calculator
 * Estilo: red de nodos conectados (inspirado en Neural Cube)
 * Los nodos representan categorías de presupuesto interconectadas
 */
const BudgetLogo = ({ size = 48, className = '' }) => {
  // Nodos: [cx, cy] relativos a viewBox 100x100
  const nodes = [
    { id: 'center', cx: 50, cy: 50, r: 6 },   // nodo central (balance)
    { id: 'n1',     cx: 50, cy: 18, r: 3.5 },  // arriba
    { id: 'n2',     cx: 76, cy: 30, r: 3.5 },  // arriba-derecha
    { id: 'n3',     cx: 82, cy: 62, r: 3.5 },  // derecha
    { id: 'n4',     cx: 62, cy: 82, r: 3.5 },  // abajo-derecha
    { id: 'n5',     cx: 32, cy: 82, r: 3.5 },  // abajo-izquierda
    { id: 'n6',     cx: 18, cy: 62, r: 3.5 },  // izquierda
    { id: 'n7',     cx: 24, cy: 30, r: 3.5 },  // arriba-izquierda
  ]

  // Conexiones desde el centro hacia cada nodo externo + algunas entre nodos
  const edges = [
    ['center', 'n1'], ['center', 'n2'], ['center', 'n3'], ['center', 'n4'],
    ['center', 'n5'], ['center', 'n6'], ['center', 'n7'],
    ['n1', 'n2'], ['n2', 'n3'], ['n3', 'n4'], ['n4', 'n5'],
    ['n5', 'n6'], ['n6', 'n7'], ['n7', 'n1'],
    ['n1', 'n3'], ['n2', 'n5'], ['n6', 'n2'],
  ]

  const getNode = (id) => nodes.find((n) => n.id === id)

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Círculo exterior con borde punteado */}
      <motion.circle
        cx="50" cy="50" r="46"
        stroke="#22c55e"
        strokeWidth="1.2"
        strokeDasharray="4 3"
        fill="none"
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '50px 50px' }}
      />

      {/* Líneas de conexión */}
      {edges.map(([a, b], i) => {
        const na = getNode(a)
        const nb = getNode(b)
        return (
          <motion.line
            key={i}
            x1={na.cx} y1={na.cy}
            x2={nb.cx} y2={nb.cy}
            stroke="#6366f1"
            strokeWidth="0.8"
            strokeOpacity="0.55"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2.5 + (i % 4) * 0.4, repeat: Infinity, delay: i * 0.1 }}
          />
        )
      })}

      {/* Símbolo $ en el centro (muy sutil, detrás del nodo central) */}
      <text
        x="50" y="54"
        textAnchor="middle"
        fontSize="7"
        fill="#4ade80"
        opacity="0.35"
        fontWeight="bold"
        fontFamily="monospace"
      >$</text>

      {/* Nodos externos */}
      {nodes.filter((n) => n.id !== 'center').map((node) => (
        <motion.circle
          key={node.id}
          cx={node.cx}
          cy={node.cy}
          r={node.r}
          fill="#6366f1"
          animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
          transition={{
            duration: 2 + Math.random() * 1.5,
            repeat: Infinity,
            delay: Math.random() * 1.5,
          }}
          style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
        />
      ))}

      {/* Nodo central (verde, más grande) */}
      <motion.circle
        cx="50" cy="50" r="6"
        fill="#22c55e"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '50px 50px' }}
      />

      {/* Halo del nodo central */}
      <motion.circle
        cx="50" cy="50" r="6"
        fill="none"
        stroke="#22c55e"
        strokeWidth="2"
        animate={{ r: [6, 13, 6], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
      />
    </svg>
  )
}

export default BudgetLogo
