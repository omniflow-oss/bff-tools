import { ref } from 'vue'
import type { CardType } from '@/types/cards'
import { cardConfigs } from '@/config/cards'
import type Card from '@/components/Card.vue'

export function useCardRefs() {
  const cardRefs = {
    jsonCard: ref<InstanceType<typeof Card>>(),
    templateCard: ref<InstanceType<typeof Card>>(),
    outputCard: ref<InstanceType<typeof Card>>()
  }

  function getCardRef(cardType: CardType) {
    const config = cardConfigs[cardType]
    const refName = config.ref as keyof typeof cardRefs
    return cardRefs[refName]?.value
  }

  return {
    cardRefs,
    getCardRef
  }
}
