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
    }

    // Draw the shape
    draw(ctx) {
        ctx.fillStyle = this.isSelected ? `${this.color}99` : this.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;

        if (this.type === 'rect') {
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

    // Draw selection visuals for direct click selection
    drawDirectSelection(ctx) {
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

    // Draw selection visuals for box selection
    drawBoxSelection(ctx) {
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        
        if (this.type === 'rect') {
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
        if (this.type === 'rect') {
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

        if (this.type === 'rect') {
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

    // Get the handle at the given point (if any)
    getHandle(px, py) {
        if (!this.isSelected || this.selectionType !== 'direct') return null;

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

    // Resize the shape based on handle movement
    resize(handle, dx, dy) {
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
            shape.x += dx;
            shape.y += dy;
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