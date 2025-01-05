// Shape class for managing individual shapes
class Shape {
    constructor(type, x, y, width, height, color) {
        this.type = type;    // 'rect' or 'circle'
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.isSelected = false;
        this.selectionType = null; // 'direct' or 'box'
        this.handleSize = 8; // Size of resize handles

        if (type === 'arrow') {
            this.startPoint = { x: this.x, y: this.y };
            this.endPoint = { x: this.x + width, y: this.y + height };
            this.arrowHeadSize = 15; // Size of arrow head
        }
    }

    // Draw the shape
    draw(ctx) {
        ctx.fillStyle = this.isSelected ? `${this.color}99` : this.color;
        ctx.strokeStyle = this.isSelected ? `${this.color}99` : this.color;
        ctx.lineWidth = 2;

        if (this.type === 'arrow') {
            this.drawArrow(ctx);
        } else if (this.type === 'rect') {
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        } else if (this.type === 'circle') {
            ctx.beginPath();
            ctx.ellipse(
                this.x + this.width/2,   // center x
                this.y + this.height/2,   // center y
                this.width/2,            // radius x
                this.height/2,           // radius y
                0,                       // rotation
                0,                       // start angle
                Math.PI * 2              // end angle
            );
            ctx.fill();
            ctx.stroke();
        }

        // Draw selection visuals if selected
        if (this.isSelected) {
            if (this.selectionType === 'direct') {
                this.drawDirectSelection(ctx);
            } else {
                this.drawBoxSelection(ctx);
            }
        }
    }

    drawArrow(ctx) {
        const dx = this.endPoint.x - this.startPoint.x;
        const dy = this.endPoint.y - this.startPoint.y;
        const angle = Math.atan2(dy, dx);
        
        // Draw arrow shaft
        ctx.beginPath();
        ctx.moveTo(this.startPoint.x, this.startPoint.y);
        ctx.lineTo(this.endPoint.x, this.endPoint.y);
        ctx.stroke();

        // Draw arrow head
        ctx.beginPath();
        ctx.moveTo(this.endPoint.x, this.endPoint.y);
        ctx.lineTo(
            this.endPoint.x - this.arrowHeadSize * Math.cos(angle - Math.PI / 6),
            this.endPoint.y - this.arrowHeadSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            this.endPoint.x - this.arrowHeadSize * Math.cos(angle + Math.PI / 6),
            this.endPoint.y - this.arrowHeadSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
    }

    // Draw selection visuals for direct click selection
    drawDirectSelection(ctx) {
        if (this.type === 'arrow') {
            // Draw endpoint handles
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 1;

            // Start point handle
            ctx.beginPath();
            ctx.arc(this.startPoint.x, this.startPoint.y, this.handleSize/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // End point handle
            ctx.beginPath();
            ctx.arc(this.endPoint.x, this.endPoint.y, this.handleSize/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        } else {
            // Draw bounding box
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);

            // Draw resize handles
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 1;

            // Corner handles
            const corners = [
                { x: this.x, y: this.y },                           // Top-left
                { x: this.x + this.width, y: this.y },             // Top-right
                { x: this.x + this.width, y: this.y + this.height }, // Bottom-right
                { x: this.x, y: this.y + this.height }             // Bottom-left
            ];

            corners.forEach(corner => {
                ctx.fillRect(
                    corner.x - this.handleSize/2,
                    corner.y - this.handleSize/2,
                    this.handleSize,
                    this.handleSize
                );
                ctx.strokeRect(
                    corner.x - this.handleSize/2,
                    corner.y - this.handleSize/2,
                    this.handleSize,
                    this.handleSize
                );
            });
        }
    }

    // Draw selection visuals for box selection
    drawBoxSelection(ctx) {
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        
        if (this.type === 'arrow') {
            // Just highlight the arrow shaft and head
            const dx = this.endPoint.x - this.startPoint.x;
            const dy = this.endPoint.y - this.startPoint.y;
            const angle = Math.atan2(dy, dx);
            
            ctx.beginPath();
            ctx.moveTo(this.startPoint.x, this.startPoint.y);
            ctx.lineTo(this.endPoint.x, this.endPoint.y);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(this.endPoint.x, this.endPoint.y);
            ctx.lineTo(
                this.endPoint.x - this.arrowHeadSize * Math.cos(angle - Math.PI / 6),
                this.endPoint.y - this.arrowHeadSize * Math.sin(angle - Math.PI / 6)
            );
            ctx.lineTo(
                this.endPoint.x - this.arrowHeadSize * Math.cos(angle + Math.PI / 6),
                this.endPoint.y - this.arrowHeadSize * Math.sin(angle + Math.PI / 6)
            );
            ctx.closePath();
            ctx.stroke();
        } else if (this.type === 'rect') {
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        } else if (this.type === 'circle') {
            ctx.beginPath();
            ctx.ellipse(
                this.x + this.width/2,
                this.y + this.height/2,
                this.width/2,
                this.height/2,
                0,
                0,
                Math.PI * 2
            );
            ctx.stroke();
        }
    }

    // Check if a point is inside the shape
    containsPoint(px, py) {
        if (this.type === 'arrow') {
            // Check if point is near the arrow shaft
            const tolerance = 5; // Distance threshold for shaft selection
            
            // Calculate distance from point to line segment (arrow shaft)
            const dx = this.endPoint.x - this.startPoint.x;
            const dy = this.endPoint.y - this.startPoint.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            
            // Normalize direction vector
            const dirX = dx / length;
            const dirY = dy / length;
            
            // Vector from start point to test point
            const vpx = px - this.startPoint.x;
            const vpy = py - this.startPoint.y;
            
            // Project test point onto line
            const proj = vpx * dirX + vpy * dirY;
            
            // Check if projection is within line segment
            if (proj < 0 || proj > length) return false;
            
            // Calculate distance from point to line
            const projX = this.startPoint.x + proj * dirX;
            const projY = this.startPoint.y + proj * dirY;
            const distSq = (px - projX) * (px - projX) + (py - projY) * (py - projY);
            
            return distSq <= tolerance * tolerance;
        } else if (this.type === 'rect') {
            return px >= this.x && px <= this.x + this.width &&
                   py >= this.y && py <= this.y + this.height;
        } else if (this.type === 'circle') {
            const cx = this.x + this.width/2;
            const cy = this.y + this.height/2;
            const rx = this.width/2;
            const ry = this.height/2;
            const dx = px - cx;
            const dy = py - cy;
            return (dx * dx)/(rx * rx) + (dy * dy)/(ry * ry) <= 1;
        }
        return false;
    }

    // Check if shape intersects with selection box
    intersectsBox(x1, y1, x2, y2) {
        const boxLeft = Math.min(x1, x2);
        const boxRight = Math.max(x1, x2);
        const boxTop = Math.min(y1, y2);
        const boxBottom = Math.max(y1, y2);

        if (this.type === 'arrow') {
            // First check if either endpoint is inside the box
            if ((this.startPoint.x >= boxLeft && this.startPoint.x <= boxRight &&
                 this.startPoint.y >= boxTop && this.startPoint.y <= boxBottom) ||
                (this.endPoint.x >= boxLeft && this.endPoint.x <= boxRight &&
                 this.endPoint.y >= boxTop && this.endPoint.y <= boxBottom)) {
                return true;
            }

            // Then check for line segment intersection with all four sides of the box
            const boxSides = [
                // Format: [x1, y1, x2, y2] for each line segment
                [boxLeft, boxTop, boxRight, boxTop],       // Top edge
                [boxRight, boxTop, boxRight, boxBottom],   // Right edge
                [boxRight, boxBottom, boxLeft, boxBottom], // Bottom edge
                [boxLeft, boxBottom, boxLeft, boxTop]      // Left edge
            ];

            // Check intersection with each side of the box
            return boxSides.some(([sideX1, sideY1, sideX2, sideY2]) => 
                this.lineSegmentsIntersect(
                    this.startPoint.x, this.startPoint.y,
                    this.endPoint.x, this.endPoint.y,
                    sideX1, sideY1,
                    sideX2, sideY2
                )
            );
        } else if (this.type === 'rect') {
            return !(this.x + this.width < boxLeft || 
                    this.x > boxRight ||
                    this.y + this.height < boxTop || 
                    this.y > boxBottom);
        } else if (this.type === 'circle') {
            const cx = this.x + this.width/2;
            const cy = this.y + this.height/2;

            // Check if ellipse center is in box
            if (cx >= boxLeft && cx <= boxRight && 
                cy >= boxTop && cy <= boxBottom) {
                return true;
            }

            // Check distance to closest point on box using elliptical distance
            const closestX = Math.max(boxLeft, Math.min(cx, boxRight));
            const closestY = Math.max(boxTop, Math.min(cy, boxBottom));
            const dx = cx - closestX;
            const dy = cy - closestY;
            
            // Use normalized ellipse equation
            return (dx * dx)/(this.width * this.width/4) + 
                   (dy * dy)/(this.height * this.height/4) <= 1;
        }
        return false;
    }

    // Helper method to check if two line segments intersect
    lineSegmentsIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
        // Calculate vectors for the two line segments
        const dx1 = x2 - x1;
        const dy1 = y2 - y1;
        const dx2 = x4 - x3;
        const dy2 = y4 - y3;

        // Calculate the determinant to check if lines are parallel
        const determinant = dx1 * dy2 - dy1 * dx2;
        
        // If determinant is 0, lines are parallel and can't intersect
        if (Math.abs(determinant) < 1e-10) return false;

        // Calculate the parameters for the intersection point
        const t1 = ((x3 - x1) * dy2 - (y3 - y1) * dx2) / determinant;
        const t2 = ((x3 - x1) * dy1 - (y3 - y1) * dx1) / determinant;

        // Check if intersection point lies within both line segments
        return t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1;
    }

    // Get the handle at the given point (if any)
    getHandle(px, py) {
        if (!this.isSelected || this.selectionType !== 'direct') return null;

        if (this.type === 'arrow') {
            // Check start point handle
            const startDist = Math.sqrt(
                (px - this.startPoint.x) * (px - this.startPoint.x) +
                (py - this.startPoint.y) * (py - this.startPoint.y)
            );
            if (startDist <= this.handleSize/2) {
                return { x: this.startPoint.x, y: this.startPoint.y, cursor: 'move', handle: 'start' };
            }

            // Check end point handle
            const endDist = Math.sqrt(
                (px - this.endPoint.x) * (px - this.endPoint.x) +
                (py - this.endPoint.y) * (py - this.endPoint.y)
            );
            if (endDist <= this.handleSize/2) {
                return { x: this.endPoint.x, y: this.endPoint.y, cursor: 'move', handle: 'end' };
            }

            return null;
        } else {
            const corners = [
                { x: this.x, y: this.y, cursor: 'nw-resize', handle: 'top-left' },
                { x: this.x + this.width, y: this.y, cursor: 'ne-resize', handle: 'top-right' },
                { x: this.x + this.width, y: this.y + this.height, cursor: 'se-resize', handle: 'bottom-right' },
                { x: this.x, y: this.y + this.height, cursor: 'sw-resize', handle: 'bottom-left' }
            ];
    
            for (const corner of corners) {
                if (px >= corner.x - this.handleSize/2 && 
                    px <= corner.x + this.handleSize/2 &&
                    py >= corner.y - this.handleSize/2 && 
                    py <= corner.y + this.handleSize/2) {
                    return corner;
                }
            }
            return null;
        }
    }

    // Resize the shape based on handle movement
    resize(handle, dx, dy) {
        if (this.type === 'arrow') {
            if (handle === 'start') {
                this.startPoint.x += dx;
                this.startPoint.y += dy;
                this.x = this.startPoint.x;
                this.y = this.startPoint.y;
            } else if (handle === 'end') {
                this.endPoint.x += dx;
                this.endPoint.y += dy;
            }
            
            // Update width and height based on new points
            this.width = this.endPoint.x - this.startPoint.x;
            this.height = this.endPoint.y - this.startPoint.y;
        } else {
            const MIN_SIZE = 20; // Minimum dimension size
        
            switch (handle) {
                case 'top-left':
                    const newX = this.x + dx;
                    const newY = this.y + dy;
                    const newWidth = this.width - dx;
                    const newHeight = this.height - dy;
                    
                    if (newWidth > MIN_SIZE) {
                        this.x = newX;
                        this.width = newWidth;
                    }
                    if (newHeight > MIN_SIZE) {
                        this.y = newY;
                        this.height = newHeight;
                    }
                    break;

                case 'top-right':
                    if (this.width + dx > MIN_SIZE) {
                        this.width += dx;
                    }
                    if (this.height - dy > MIN_SIZE) {
                        this.y += dy;
                        this.height -= dy;
                    }
                    break;

                case 'bottom-right':
                    if (this.width + dx > MIN_SIZE) {
                        this.width += dx;
                    }
                    if (this.height + dy > MIN_SIZE) {
                        this.height += dy;
                    }
                    break;

                case 'bottom-left':
                    if (this.width - dx > MIN_SIZE) {
                        this.x += dx;
                        this.width -= dx;
                    }
                    if (this.height + dy > MIN_SIZE) {
                        this.height += dy;
                    }
                    break;
            }
        }
    }
}

// Canvas Manager class
class CanvasManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // State management
        this.shapes = [];
        this.selectedShapes = [];
        this.isSelecting = false;
        this.isDragging = false;
        this.isResizing = false;
        this.activeHandle = null;
        this.selectionStart = { x: 0, y: 0 };
        this.selectionCurrent = { x: 0, y: 0 };
        this.lastMousePos = { x: 0, y: 0 };

        // Bind event handlers
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);

        // Set up event listeners
        this.setupEventListeners();
    }

    // Set up event listeners
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        this.canvas.addEventListener('mouseleave', this.handleMouseUp);
    }

    // Handle mouse down event
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check for handle interaction first
        if (this.selectedShapes.length === 1) {
            const shape = this.selectedShapes[0];
            const handle = shape.getHandle(x, y);
            
            if (handle) {
                this.isResizing = true;
                this.activeHandle = handle;
                this.canvas.style.cursor = handle.cursor;
                return;
            }
        }

        const clickedShape = this.shapes.find(shape => shape.containsPoint(x, y));

        if (clickedShape) {
            if (e.shiftKey) {
                // Shift-click behavior
                if (clickedShape.isSelected) {
                    // Remove from selection
                    clickedShape.isSelected = false;
                    clickedShape.selectionType = null;
                    const index = this.selectedShapes.indexOf(clickedShape);
                    if (index > -1) {
                        this.selectedShapes.splice(index, 1);
                    }
                } else {
                    // Add to selection
                    clickedShape.isSelected = true;
                    clickedShape.selectionType = this.selectedShapes.length === 0 ? 'direct' : 'box';
                    this.selectedShapes.push(clickedShape);
                }
            } else {
                // Regular click
                if (!clickedShape.isSelected) {
                    // If clicking an unselected shape, clear others and select this one
                    this.clearSelection();
                    clickedShape.isSelected = true;
                    clickedShape.selectionType = 'direct';
                    this.selectedShapes.push(clickedShape);
                } else if (this.selectedShapes.length === 1) {
                    // If clicking the only selected shape, maintain direct selection
                    clickedShape.selectionType = 'direct';
                } else {
                    // If clicking a shape that's part of a group selection,
                    // maintain the group selection
                    // Don't change anything about the selection
                }
            }
            this.isDragging = true;
        } else {
            // Start box selection
            if (!e.shiftKey) {
                this.clearSelection();
            }
            this.isSelecting = true;
            this.selectionStart = { x, y };
            this.selectionCurrent = { x, y };
        }

        this.lastMousePos = { x, y };
        this.draw();
    }

    // Handle mouse move event
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Update cursor based on handle hover
        if (this.selectedShapes.length === 1 && !this.isResizing && !this.isDragging) {
            const shape = this.selectedShapes[0];
            const handle = shape.getHandle(x, y);
            this.canvas.style.cursor = handle ? handle.cursor : 'default';
        }

        if (this.isResizing && this.activeHandle) {
            const dx = x - this.lastMousePos.x;
            const dy = y - this.lastMousePos.y;
            this.selectedShapes[0].resize(this.activeHandle.handle, dx, dy);
        } else if (this.isSelecting) {
            this.selectionCurrent = { x, y };
            this.updateBoxSelection();
        } else if (this.isDragging) {
            const dx = x - this.lastMousePos.x;
            const dy = y - this.lastMousePos.y;
            this.moveSelectedShapes(dx, dy);
        }

        this.lastMousePos = { x, y };
        this.draw();
    }

    // Handle mouse up event
    handleMouseUp() {
        this.isSelecting = false;
        this.isDragging = false;
        this.isResizing = false;
        this.activeHandle = null;
        this.canvas.style.cursor = 'default';
        this.draw();
    }

    // Update shapes within selection box
    updateBoxSelection() {
        this.shapes.forEach(shape => {
            if (shape.intersectsBox(
                this.selectionStart.x, this.selectionStart.y,
                this.selectionCurrent.x, this.selectionCurrent.y
            )) {
                if (!shape.isSelected) {
                    shape.isSelected = true;
                    shape.selectionType = 'box';
                    this.selectedShapes.push(shape);
                }
            } else if (shape.selectionType === 'box') {
                shape.isSelected = false;
                shape.selectionType = null;
                const index = this.selectedShapes.indexOf(shape);
                if (index > -1) {
                    this.selectedShapes.splice(index, 1);
                }
            }
        });
    }

    // Move selected shapes
    moveSelectedShapes(dx, dy) {
        this.selectedShapes.forEach(shape => {
            if (shape.type === 'arrow') {
                // For arrows, move both endpoints and update base coordinates
                shape.startPoint.x += dx;
                shape.startPoint.y += dy;
                shape.endPoint.x += dx;
                shape.endPoint.y += dy;
                
                // Update base coordinates to match new position
                shape.x = shape.startPoint.x;
                shape.y = shape.startPoint.y;
                
                // Update width and height to maintain arrow dimensions
                shape.width = shape.endPoint.x - shape.startPoint.x;
                shape.height = shape.endPoint.y - shape.startPoint.y;
            } else {
                // For other shapes, simply update position
                shape.x += dx;
                shape.y += dy;
            }
        });
    }

    // Clear all selections
    clearSelection() {
        this.selectedShapes.forEach(shape => {
            shape.isSelected = false;
            shape.selectionType = null;
        });
        this.selectedShapes = [];
    }

    // Add a new shape
    addShape(type, x, y, width, height, color) {
        const shape = new Shape(type, x, y, width, height, color);
        this.shapes.push(shape);
        this.draw();
    }

    // Main draw function
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw all shapes
        this.shapes.forEach(shape => shape.draw(this.ctx));

        // Draw selection box if selecting
        if (this.isSelecting) {
            this.ctx.strokeStyle = '#0066ff';
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([5, 5]);
            this.ctx.strokeRect(
                this.selectionStart.x,
                this.selectionStart.y,
                this.selectionCurrent.x - this.selectionStart.x,
                this.selectionCurrent.y - this.selectionStart.y
            );
            this.ctx.setLineDash([]);
        }
    }
}

export { Shape, CanvasManager };