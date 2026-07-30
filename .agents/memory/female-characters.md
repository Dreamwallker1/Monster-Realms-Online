---
name: Female Characters (Luna + Vera)
description: Luna and Vera character configs and Phaser sprite rendering approach
---

# Female Characters

## Characters added
- **Luna** (id: `luna`): teen girl, gender=`female`, style=`teen`. Dark navy hair with side ponytail + purple hair tie. Indigo school uniform. Navy shorts. `avatarColor: '#6366f1'`
- **Vera** (id: `vera`): adult woman, gender=`female`, style=`adult`. Deep auburn long hair (flows left side). Teal jacket. Dark teal slacks. `avatarColor: '#0f766e'`

## Sprite dispatch in WorldScene
`createHumanSprite` dispatches to `createLunaSprite`, `createVeraSprite`, or `createMaleSprite` based on `char.gender` + `char.style`. The `CharacterConfig` interface now has `gender: 'male' | 'female'` and `style?: 'teen' | 'adult'`.

**Why:** Phaser draws sprites with Graphics primitives — no asset loading needed. Female characters have different body proportions (narrower torso, skirt/flowing hair) requiring separate draw functions.

**How to apply:** Any new female character must set `gender: 'female'` in CharacterConfig AND have a matching draw function (or reuse existing ones). Male characters fall through to `createMaleSprite` by default.
