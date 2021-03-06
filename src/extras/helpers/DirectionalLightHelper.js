/**
 * @author alteredq / http://alteredqualia.com/
 *
 *	- shows directional light color, intensity, position, orientation and target
 */

THREE.DirectionalLightHelper = function ( light, sphereSize, arrowLength ) {

	THREE.Object3D.call( this );

	this.light = light;

	// position

	this.position = light.position;

	// direction

	this.direction = new THREE.Vector3();
	this.direction.sub( light.target.position, light.position );

	// color

	this.color = light.color.clone();

	var intensity = THREE.Math.clamp( light.intensity, 0, 1 );

	this.color.r *= intensity;
	this.color.g *= intensity;
	this.color.b *= intensity;

	var hexColor = this.color.getHex();

	// light helper

	var bulbGeometry = new THREE.SphereGeometry( sphereSize, 16, 8 );
	var raysGeometry = new THREE.AsteriskGeometry( sphereSize * 1.25, sphereSize * 2.25 );

	var bulbMaterial = new THREE.MeshBasicMaterial( { color: hexColor, fog: false } );
	var raysMaterial = new THREE.LineBasicMaterial( { color: hexColor, fog: false } );

	this.lightArrow = new THREE.ArrowHelper( this.direction, null, arrowLength, hexColor );
	this.lightSphere = new THREE.Mesh( bulbGeometry, bulbMaterial );

	this.lightArrow.cone.material.fog = false;
	this.lightArrow.line.material.fog = false;

	this.lightRays = new THREE.Line( raysGeometry, raysMaterial, THREE.LinePieces );

	this.add( this.lightArrow );
	this.add( this.lightSphere );
	this.add( this.lightRays );

	this.lightSphere.properties.isGizmo = true;
	this.lightSphere.properties.gizmoSubject = light;
	this.lightSphere.properties.gizmoRoot = this;

	// light target helper

	this.targetSphere = null;

	if ( light.target.properties.targetInverse ) {

		var targetGeo = new THREE.SphereGeometry( sphereSize, 8, 4 );
		var targetMaterial = new THREE.MeshBasicMaterial( { color: hexColor, wireframe: true, fog: false } );

		this.targetSphere = new THREE.Mesh( targetGeo, targetMaterial );
		this.targetSphere.position = light.target.position;

		this.targetSphere.properties.isGizmo = true;
		this.targetSphere.properties.gizmoSubject = light.target;
		this.targetSphere.properties.gizmoRoot = this.targetSphere;

		var lineMaterial = new THREE.LineDashedMaterial( { color: hexColor, dashSize: 4, gapSize: 4, opacity: 0.75, transparent: true, fog: false } );
		var lineGeometry = new THREE.Geometry();
		lineGeometry.vertices.push( this.position.clone() );
		lineGeometry.vertices.push( this.targetSphere.position.clone() );
		lineGeometry.computeLineDistances();

		this.targetLine = new THREE.Line( lineGeometry, lineMaterial );
		this.targetLine.properties.isGizmo = true;

	}

	//

	this.properties.isGizmo = true;

}

THREE.DirectionalLightHelper.prototype = Object.create( THREE.Object3D.prototype );

THREE.DirectionalLightHelper.prototype.update = function () {

	// update arrow orientation
	// pointing from light to target

	this.direction.sub( this.light.target.position, this.light.position );
	this.lightArrow.setDirection( this.direction );

	// update arrow, spheres, rays and line colors to light color * light intensity

	this.color.copy( this.light.color );

	var intensity = THREE.Math.clamp( this.light.intensity, 0, 1 );
	this.color.r *= intensity;
	this.color.g *= intensity;
	this.color.b *= intensity;

	this.lightArrow.setColor( this.color.getHex() );
	this.lightSphere.material.color.copy( this.color );
	this.lightRays.material.color.copy( this.color );

	this.targetSphere.material.color.copy( this.color );
	this.targetLine.material.color.copy( this.color );

	// update target line vertices

	this.targetLine.geometry.vertices[ 0 ].copy( this.light.position );
	this.targetLine.geometry.vertices[ 1 ].copy( this.light.target.position );

	this.targetLine.geometry.computeLineDistances();
	this.targetLine.geometry.verticesNeedUpdate = true;

}

