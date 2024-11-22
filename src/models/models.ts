interface AuthResponse {
  accessToken: string;
  userId: string;
}

interface TicketPriceEntity {
  categoryName: string;
  price: number;
  count: number;
}

export interface ApiResponse<T> {
  success: boolean;
  date: Date;
  message?: string;
  data?: T;
}
