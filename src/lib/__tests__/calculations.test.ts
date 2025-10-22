import { round, recalculateRow } from '../calculations'
import { ReceiptItem } from '@/types'

describe('calculations', () => {
  describe('round', () => {
    it('should round to 2 decimal places', () => {
      expect(round(10.123)).toBe(10.12)
      expect(round(10.126)).toBe(10.13)
      expect(round(10.125)).toBe(10.13) // Banker's rounding
    })

    it('should handle integers', () => {
      expect(round(10)).toBe(10)
      expect(round(0)).toBe(0)
    })

    it('should handle negative numbers', () => {
      expect(round(-10.123)).toBe(-10.12)
      expect(round(-10.126)).toBe(-10.13)
    })
  })

  describe('recalculateRow', () => {
    const baseRow: ReceiptItem = {
      '#': 1,
      Qty: 2,
      Unit: 'pcs',
      Price: 100,
      Art: 'TEST-001',
      Item: 'Test Item',
      Net: 200,
      VAT: 40,
      Total: 240
    }

    describe('when Qty changes', () => {
      it('should recalculate Net and Total', () => {
        const result = recalculateRow(baseRow, 'Qty', 3)

        expect(result.Qty).toBe(3)
        expect(result.Price).toBe(100)
        expect(result.Net).toBe(300) // 100 * 3
        expect(result.VAT).toBe(40) // unchanged
        expect(result.Total).toBe(340) // 300 + 40
      })

      it('should handle decimal quantities', () => {
        const result = recalculateRow(baseRow, 'Qty', 2.5)

        expect(result.Qty).toBe(2.5)
        expect(result.Net).toBe(250) // 100 * 2.5
        expect(result.Total).toBe(290) // 250 + 40
      })
    })

    describe('when Price changes', () => {
      it('should recalculate Net and Total', () => {
        const result = recalculateRow(baseRow, 'Price', 150)

        expect(result.Price).toBe(150)
        expect(result.Qty).toBe(2)
        expect(result.Net).toBe(300) // 150 * 2
        expect(result.VAT).toBe(40) // unchanged
        expect(result.Total).toBe(340) // 300 + 40
      })

      it('should round Net and Total correctly', () => {
        const result = recalculateRow(baseRow, 'Price', 33.33)

        expect(result.Net).toBe(66.66) // 33.33 * 2 = 66.66
        expect(result.Total).toBe(106.66) // 66.66 + 40
      })
    })

    describe('when VAT changes', () => {
      it('should adjust Price to keep Total constant', () => {
        const result = recalculateRow(baseRow, 'VAT', 60)

        expect(result.VAT).toBe(60)
        expect(result.Total).toBe(240) // unchanged
        expect(result.Net).toBe(180) // 240 - 60
        expect(result.Price).toBe(90) // 180 / 2
        expect(result.Qty).toBe(2)
      })

      it('should handle VAT increase', () => {
        const result = recalculateRow(baseRow, 'VAT', 80)

        expect(result.VAT).toBe(80)
        expect(result.Total).toBe(240) // unchanged
        expect(result.Net).toBe(160) // 240 - 80
        expect(result.Price).toBe(80) // 160 / 2
      })

      it('should handle VAT decrease', () => {
        const result = recalculateRow(baseRow, 'VAT', 20)

        expect(result.VAT).toBe(20)
        expect(result.Total).toBe(240) // unchanged
        expect(result.Net).toBe(220) // 240 - 20
        expect(result.Price).toBe(110) // 220 / 2
      })

      it('should handle division by Qty correctly', () => {
        const row = { ...baseRow, Qty: 3, Total: 300, VAT: 30 }
        const result = recalculateRow(row, 'VAT', 60)

        expect(result.Net).toBe(240) // 300 - 60
        expect(result.Price).toBe(80) // 240 / 3
      })
    })

    describe('when Total changes', () => {
      it('should adjust Price to keep VAT constant', () => {
        const result = recalculateRow(baseRow, 'Total', 300)

        expect(result.Total).toBe(300)
        expect(result.VAT).toBe(40) // unchanged
        expect(result.Net).toBe(260) // 300 - 40
        expect(result.Price).toBe(130) // 260 / 2
        expect(result.Qty).toBe(2)
      })

      it('should handle Total increase', () => {
        const result = recalculateRow(baseRow, 'Total', 400)

        expect(result.Total).toBe(400)
        expect(result.VAT).toBe(40) // unchanged
        expect(result.Net).toBe(360) // 400 - 40
        expect(result.Price).toBe(180) // 360 / 2
      })

      it('should handle Total decrease', () => {
        const result = recalculateRow(baseRow, 'Total', 200)

        expect(result.Total).toBe(200)
        expect(result.VAT).toBe(40) // unchanged
        expect(result.Net).toBe(160) // 200 - 40
        expect(result.Price).toBe(80) // 160 / 2
      })
    })

    describe('when Net changes', () => {
      it('should recalculate Price and Total', () => {
        const result = recalculateRow(baseRow, 'Net', 300)

        expect(result.Net).toBe(300)
        expect(result.Price).toBe(150) // 300 / 2
        expect(result.Total).toBe(340) // 300 + 40
        expect(result.VAT).toBe(40) // unchanged
        expect(result.Qty).toBe(2)
      })

      it('should handle decimal Net values', () => {
        const result = recalculateRow(baseRow, 'Net', 157.01)

        expect(result.Net).toBe(157.01)
        expect(result.Price).toBe(78.51) // 157.01 / 2 = 78.505 → 78.51
        expect(result.Total).toBe(197.01) // 157.01 + 40
      })
    })

    describe('edge cases', () => {
      it('should handle zero Qty gracefully', () => {
        const row = { ...baseRow, Qty: 0 }
        const result = recalculateRow(row, 'VAT', 50)

        // Should not divide by zero
        expect(result.Price).toBe(100) // unchanged
      })

      it('should handle zero values', () => {
        const row = { ...baseRow, Price: 0, Net: 0, VAT: 0, Total: 0 }
        const result = recalculateRow(row, 'Qty', 5)

        expect(result.Net).toBe(0)
        expect(result.Total).toBe(0)
      })

      it('should not modify non-numeric fields', () => {
        const result = recalculateRow(baseRow, 'Item', 'New Item' as any)

        expect(result.Item).toBe('New Item')
        expect(result.Price).toBe(100)
        expect(result.Net).toBe(200)
        expect(result.Total).toBe(240)
      })

      it('should handle # field without recalculation', () => {
        const result = recalculateRow(baseRow, '#', 5)

        expect(result['#']).toBe(5)
        expect(result.Price).toBe(100)
        expect(result.Net).toBe(200)
        expect(result.Total).toBe(240)
      })
    })

    describe('rounding consistency', () => {
      it('should maintain consistency across multiple operations', () => {
        let row = baseRow

        // Change Qty
        row = recalculateRow(row, 'Qty', 3)
        expect(row.Net).toBe(300)
        expect(row.Total).toBe(340)

        // Change VAT - Total stays at 340
        row = recalculateRow(row, 'VAT', 60)
        expect(row.Total).toBe(340) // should stay the same
        // Net = Total - VAT = 340 - 60 = 280
        // Price = Net / Qty = 280 / 3 = 93.333... → 93.33
        // But then Net = Price * Qty = 93.33 * 3 = 279.99 (due to rounding)
        expect(row.Net).toBe(279.99)
        expect(row.Price).toBe(93.33)
      })

      it('should handle complex decimal calculations', () => {
        const row: ReceiptItem = {
          '#': 1,
          Qty: 1.85,
          Unit: 'pcs',
          Price: 84.72,
          Art: 'TEST',
          Item: 'Test',
          Net: 156.73,
          VAT: 10.99,
          Total: 167.72
        }

        const result = recalculateRow(row, 'Price', 84.72)

        expect(result.Net).toBe(156.73) // 84.72 * 1.85 = 156.732 → 156.73
        expect(result.Total).toBe(167.72) // 156.73 + 10.99
      })
    })
  })
})
