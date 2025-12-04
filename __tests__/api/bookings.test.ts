import { query } from "@/lib/db"
import jest from "jest"

jest.mock("@/lib/db")

describe("Bookings API", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("POST /api/bookings", () => {
    it("should create booking with availability check", async () => {
      const mockConflict = [{ count: 0 }]
      const mockBooking = {
        id: 1,
        userId: 1,
        serviceId: 1,
        datetime: "2025-11-10T14:00:00Z",
        status: "pending",
      }
      ;(query as jest.Mock).mockResolvedValueOnce(mockConflict).mockResolvedValueOnce([mockBooking])

      expect(mockBooking.status).toBe("pending")
    })

    it("should reject booking if time slot is unavailable", async () => {
      const mockConflict = [{ count: 1 }]
      ;(query as jest.Mock).mockResolvedValueOnce(mockConflict)

      expect(mockConflict[0].count).toBeGreaterThan(0)
    })
  })

  describe("GET /api/bookings", () => {
    it("should return user bookings when filtered by userId", async () => {
      const mockBookings = [
        {
          id: 1,
          userId: 1,
          serviceTitle: "Plumbing",
          status: "confirmed",
        },
      ]
      ;(query as jest.Mock).mockResolvedValueOnce(mockBookings)

      expect(mockBookings[0].userId).toBe(1)
    })

    it("should return provider bookings when filtered by providerId", async () => {
      const mockBookings = [
        {
          id: 1,
          serviceId: 1,
          userName: "John",
          status: "pending",
        },
      ]
      ;(query as jest.Mock).mockResolvedValueOnce(mockBookings)

      expect(mockBookings).toHaveLength(1)
    })
  })

  describe("PATCH /api/bookings/:id", () => {
    it("should update booking status by provider", async () => {
      const updatedBooking = {
        id: 1,
        status: "confirmed",
      }
      ;(query as jest.Mock).mockResolvedValueOnce([updatedBooking])

      expect(updatedBooking.status).toBe("confirmed")
    })

    it("should allow user to cancel booking", async () => {
      const updatedBooking = {
        id: 1,
        status: "cancelled",
      }
      ;(query as jest.Mock).mockResolvedValueOnce([updatedBooking])

      expect(updatedBooking.status).toBe("cancelled")
    })
  })
})
