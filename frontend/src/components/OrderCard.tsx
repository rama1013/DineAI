import React from 'react';

interface OrderAttachment {
  order_id: string;
  status: string;
  product_name: string;
  product_brand: string;
  product_image: string;
  order_total: string;
}

interface OrderCardProps {
  attachment: OrderAttachment;
}

const OrderCard: React.FC<OrderCardProps> = ({ attachment }) => {
  return (
    <div className="order-card">
      <div className="order-card-header">
        <h4>Order #{attachment.order_id}</h4>
        <span className={`order-status ${attachment.status.toLowerCase()}`}>
          {attachment.status}
        </span>
      </div>
      
      <div className="order-card-content">
        <div className="product-info">
          <img 
            src={attachment.product_image} 
            alt={attachment.product_name}
            className="product-image"
            onError={(e) => {
              // Fallback to a placeholder image if the URL fails
              e.currentTarget.src = '/blur_bg_image_new.png';
            }}
          />
          <div className="product-details">
            <h5>{attachment.product_name}</h5>
            <p className="product-brand">{attachment.product_brand}</p>
            <p className="order-total">
              {attachment.order_total.startsWith('$') ? attachment.order_total : `$${attachment.order_total}`}
            </p>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .order-card {
          background: #ffffff;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 16px;
          margin: 8px 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          max-width: 350px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
        
        .order-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .order-card-header h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }
        
        .order-status {
          padding: 4px 8px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .order-status.delivered {
          background: #e8f5e8;
          color: #2d5a2d;
        }
        
        .order-status.shipped {
          background: #e8f0ff;
          color: #1e40af;
        }
        
        .order-status.confirmed {
          background: #fff7ed;
          color: #d97706;
        }
        
        .order-status.pending {
          background: #fef3c7;
          color: #d97706;
        }
        
        .order-card-content {
          margin-top: 12px;
        }
        
        .product-info {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        
        .product-image {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }
        
        .product-details {
          flex: 1;
        }
        
        .product-details h5 {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 600;
          color: #333;
          line-height: 1.3;
        }
        
        .product-brand {
          margin: 0 0 4px 0;
          font-size: 12px;
          color: #666;
          font-weight: 500;
        }
        
        .order-total {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #000;
        }
      `}</style>
    </div>
  );
};

export default OrderCard;
