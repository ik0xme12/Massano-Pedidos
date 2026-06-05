import "./global.css"

import { StatusBar } from "expo-status-bar"
import { ScrollView, Text, TouchableOpacity, View, Image } from "react-native"

const CATEGORIES = ["Todo", "Desayunos", "Cafetería", "Almuerzos", "Postres"]

const MOCK_PRODUCTS = [
  {
    id: "1",
    name: "Tostado de jamón y brie",
    description: "Pan de masa madre, jamón serrano y queso brie fundido",
    price: 3200,
    category: "Desayunos",
    badge: "Más pedido",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=200&h=200&fit=crop",
  },
  {
    id: "2",
    name: "Croissant de manteca",
    description: "Hojaldrado artesanal con mermelada de frutos rojos",
    price: 1800,
    category: "Desayunos",
    badge: null,
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200&h=200&fit=crop",
  },
  {
    id: "3",
    name: "Café especial",
    description: "Espresso doble, leche vaporizada y un toque de canela",
    price: 1400,
    category: "Cafetería",
    badge: "Clásico",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop",
  },
  {
    id: "4",
    name: "Torta de chocolate belga",
    description: "Ganache 70%, bizcochuelo húmedo y avellanas",
    price: 2400,
    category: "Postres",
    badge: "Nuevo",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop",
  },
]

function formatPrice(amount: number) {
  return `$${amount.toLocaleString("es-AR")}`
}

export default function App() {
  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />

      {/* ── Header ── */}
      <View className="bg-olive pt-14 pb-4 px-5">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-gold font-bold tracking-widest text-lg uppercase">
              Massano
            </Text>
            <Text className="text-gold/60 text-[10px] tracking-[4px] uppercase">
              · Cafetería ·
            </Text>
          </View>
          <TouchableOpacity className="relative">
            <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
              <Text className="text-white text-base">🛍</Text>
            </View>
            <View className="absolute top-1 right-1 w-2 h-2 rounded-full bg-gold" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Hero banner ── */}
      <View className="bg-olive px-5 pb-8">
        <View className="flex-row items-center gap-2 mb-3">
          <View className="h-px w-8 bg-gold" />
          <Text className="text-gold text-[11px] font-medium tracking-[3px] uppercase">
            Pedidos online
          </Text>
        </View>
        <Text className="text-white text-3xl font-bold leading-tight mb-2">
          El sabor de Massano,{"\n"}
          <Text className="text-gold">en tu puerta.</Text>
        </Text>
        <Text className="text-white/60 text-sm mb-5">
          20–35 min · Envío $600 · ⭐ 4.9
        </Text>
        <TouchableOpacity className="self-start bg-gold rounded-full px-6 py-3">
          <Text className="text-brand-black font-semibold text-sm tracking-wide">
            Ver menú completo
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Categorías ── */}
      <View className="bg-card border-b border-border">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-5 py-3 gap-2"
        >
          {CATEGORIES.map((cat, i) => (
            <TouchableOpacity
              key={cat}
              className={`px-4 py-1.5 rounded-full ${
                i === 0 ? "bg-brand-black" : "bg-muted"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  i === 0 ? "text-white" : "text-muted-foreground"
                }`}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Lista de productos ── */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-6 pb-4">
          <Text className="text-2xl font-bold text-foreground">
            Destacados
          </Text>
        </View>

        <View className="px-5 pb-10">
          {MOCK_PRODUCTS.map((product, index) => (
            <View
              key={product.id}
              className={`flex-row items-start gap-4 py-5 ${
                index < MOCK_PRODUCTS.length - 1 ? "border-b border-border" : ""
              }`}
            >
              {/* Info */}
              <View className="flex-1">
                {/* Category + badge */}
                <View className="flex-row items-center gap-2 mb-1">
                  <Text className="text-[11px] text-muted-foreground uppercase tracking-wider">
                    {product.category}
                  </Text>
                  {product.badge && (
                    <View className="bg-gold/15 border border-gold/20 px-2 py-0.5 rounded-full">
                      <Text className="text-[10px] font-semibold text-gold-dark">
                        {product.badge}
                      </Text>
                    </View>
                  )}
                </View>
                {/* Name */}
                <Text className="text-base font-semibold text-foreground mb-1 leading-snug">
                  {product.name}
                </Text>
                {/* Description */}
                <Text className="text-sm text-muted-foreground mb-3" numberOfLines={2}>
                  {product.description}
                </Text>
                {/* Price + CTA */}
                <View className="flex-row items-center gap-3">
                  <Text className="text-sm font-bold text-foreground">
                    {formatPrice(product.price)}
                  </Text>
                  <TouchableOpacity className="border border-brand-black rounded-full px-4 py-1.5">
                    <Text className="text-xs font-medium text-brand-black">
                      + Agregar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Image */}
              <Image
                source={{ uri: product.image }}
                className="w-24 h-24 rounded-xl"
                resizeMode="cover"
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}
